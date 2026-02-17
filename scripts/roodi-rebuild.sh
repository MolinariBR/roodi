#!/usr/bin/env bash
#
# ROODI - Incremental rebuild + PM2 restart (no VPS bootstrap).
#
# Use after `git pull` to rebuild only what changed.
#
# Examples (VPS):
#   sudo bash scripts/roodi-rebuild.sh --backend
#   sudo bash scripts/roodi-rebuild.sh --admin
#   sudo bash scripts/roodi-rebuild.sh --landing
#   sudo bash scripts/roodi-rebuild.sh --all
#
# Options:
#   --backend               Rebuild backend (migrate + prisma generate + build) and restart PM2
#   --admin                 Rebuild frontend-admin and restart PM2
#   --landing               Rebuild landing (Packages/Roodi) and restart PM2
#   --all                   Rebuild everything and restart PM2 apps
#   --skip-install          Skip npm install/ci (faster, use only if deps didn't change)
#   --pull                  Run `git pull --ff-only` before rebuilding
#   --self-test             Dry-run (does not execute commands)
#
set -Eeuo pipefail
IFS=$'\n\t'

MODE=""
SKIP_INSTALL="false"
DO_PULL="false"
SELF_TEST="false"
ROODI_ENV="${ROODI_ENV:-production}"

print_help() {
  sed -n '1,120p' "$0"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backend|--admin|--landing|--all)
      MODE="${1#--}"
      shift
      ;;
    --skip-install)
      SKIP_INSTALL="true"
      shift
      ;;
    --pull)
      DO_PULL="true"
      shift
      ;;
    --self-test)
      SELF_TEST="true"
      shift
      ;;
    --help|-h)
      print_help
      exit 0
      ;;
    *)
      echo "Opcao invalida: $1" >&2
      exit 1
      ;;
  esac
done

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }
log() { printf '[%s] %s\n' "$(timestamp)" "$*"; }
fail() { log "ERROR: $*"; exit 1; }

run() {
  if [[ "${SELF_TEST}" == "true" ]]; then
    log "DRY-RUN: $*"
    return 0
  fi
  "$@"
}

need_cmd() {
  if [[ "${SELF_TEST}" == "true" ]]; then
    return 0
  fi
  command -v "$1" >/dev/null 2>&1 || fail "Comando ausente: $1"
}

repo_root() {
  local root
  root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
  if [[ -n "${root}" ]]; then
    echo "${root}"
    return 0
  fi
  # Fallback for deployments without .git (still supports rebuild; --pull won't work).
  echo "$(cd "$(dirname "$0")/.." && pwd)"
}

APP_DIR="$(repo_root)"
BACKEND_DIR="${APP_DIR}/Packages/Backend"
ADMIN_DIR="${APP_DIR}/Packages/Frontend-admin"
LANDING_DIR="${APP_DIR}/Packages/Roodi"

ECOSYSTEM_FILE="/opt/roodi/ecosystem.config.cjs"

if [[ "${ROODI_ENV}" != "production" ]]; then
  fail "Este script suporta apenas production. (ROODI_ENV=${ROODI_ENV})"
fi

BACKEND_ENV_FILE="${BACKEND_DIR}/.env.production"

ecosystem_app_cwd() {
  local app_name="$1"
  if [[ "${SELF_TEST}" == "true" ]]; then
    return 0
  fi
  if [[ ! -f "${ECOSYSTEM_FILE}" ]]; then
    return 0
  fi

  # Use Node to parse the JS module safely and reliably.
  node -e "const e=require('${ECOSYSTEM_FILE}'); const a=(e.apps||[]).find(x=>x.name==='${app_name}'); if(a?.cwd) process.stdout.write(String(a.cwd));" 2>/dev/null || true
}

validate_workdir_matches_pm2() {
  if [[ "${SELF_TEST}" == "true" ]]; then
    return 0
  fi

  local backend_cwd admin_cwd landing_cwd
  backend_cwd="$(ecosystem_app_cwd roodi-backend)"
  admin_cwd="$(ecosystem_app_cwd roodi-admin)"
  landing_cwd="$(ecosystem_app_cwd roodi-landing)"

  if [[ -n "${backend_cwd}" && "${backend_cwd}" != "${BACKEND_DIR}" ]]; then
    fail "PM2 roodi-backend aponta para '${backend_cwd}', mas este repo eh '${BACKEND_DIR}'. Rode o script no repo correto."
  fi
  if [[ -n "${admin_cwd}" && "${admin_cwd}" != "${ADMIN_DIR}" ]]; then
    fail "PM2 roodi-admin aponta para '${admin_cwd}', mas este repo eh '${ADMIN_DIR}'. Rode o script no repo correto."
  fi
  if [[ -n "${landing_cwd}" && "${landing_cwd}" != "${LANDING_DIR}" ]]; then
    fail "PM2 roodi-landing aponta para '${landing_cwd}', mas este repo eh '${LANDING_DIR}'. Rode o script no repo correto."
  fi
}

ensure_paths() {
  [[ -d "${BACKEND_DIR}" ]] || fail "Backend nao encontrado: ${BACKEND_DIR}"
  [[ -d "${ADMIN_DIR}" ]] || fail "Frontend-admin nao encontrado: ${ADMIN_DIR}"
  [[ -d "${LANDING_DIR}" ]] || fail "Landing nao encontrada: ${LANDING_DIR}"
  [[ -f "${BACKEND_ENV_FILE}" ]] || fail "Env nao encontrado: ${BACKEND_ENV_FILE}"
}

ensure_mode() {
  if [[ -n "${MODE}" ]]; then
    return 0
  fi

  if [[ ! -t 0 ]]; then
    fail "Nenhum modo informado. Use --backend|--admin|--landing|--all."
  fi

  cat <<'EOF'
Escolha o rebuild:
  1) Backend (API)
  2) Frontend-admin
  3) Landing (Roodi)
  4) Todos
EOF
  printf 'Opcao [1-4]: '
  read -r choice
  case "${choice}" in
    1) MODE="backend" ;;
    2) MODE="admin" ;;
    3) MODE="landing" ;;
    4) MODE="all" ;;
    *) fail "Opcao invalida: ${choice}" ;;
  esac
}

npm_install() {
  local dir="$1"
  if [[ "${SKIP_INSTALL}" == "true" ]]; then
    log "SKIP: npm install (${dir})"
    return 0
  fi
  if [[ -f "${dir}/package-lock.json" ]]; then
    run npm --prefix "${dir}" ci
  else
    run npm --prefix "${dir}" install
  fi
}

ensure_env_symlinks() {
  # Keep env centralized in Backend; admin/landing read via symlink.
  run ln -sf "${BACKEND_ENV_FILE}" "${ADMIN_DIR}/.env.production"
  run ln -sf "${BACKEND_ENV_FILE}" "${LANDING_DIR}/.env.production"
}

git_pull_ff_only() {
  if [[ "${DO_PULL}" != "true" ]]; then
    return 0
  fi
  if ! git -C "${APP_DIR}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    fail "--pull requer um repositorio git (nao encontrado em ${APP_DIR})"
  fi
  log "Git: pull (ff-only)"
  run git -C "${APP_DIR}" pull --ff-only
}

pm2_restart_app() {
  local app_name="$1"
  if [[ "${SELF_TEST}" == "true" ]]; then
    log "DRY-RUN: pm2 restart ${app_name}"
    return 0
  fi

  need_cmd pm2

  if pm2 describe "${app_name}" >/dev/null 2>&1; then
    run pm2 restart "${app_name}" --update-env
    run pm2 save
    return 0
  fi

  if [[ -f "${ECOSYSTEM_FILE}" ]]; then
    log "PM2 app '${app_name}' nao encontrado. Usando ecosystem: ${ECOSYSTEM_FILE}"
    run pm2 startOrReload "${ECOSYSTEM_FILE}" --update-env
    run pm2 save
    return 0
  fi

  fail "PM2 app '${app_name}' nao encontrado e ecosystem nao existe: ${ECOSYSTEM_FILE}"
}

rebuild_backend() {
  log "Backend: deps"
  npm_install "${BACKEND_DIR}"

  log "Backend: migrate"
  run env ROODI_ENV="${ROODI_ENV}" NODE_ENV=production npm --prefix "${BACKEND_DIR}" run db:migrate

  log "Backend: prisma generate"
  run bash -lc "cd \"${BACKEND_DIR}\" && env ROODI_ENV=\"${ROODI_ENV}\" NODE_ENV=production npx prisma generate --schema prisma/schema.prisma"

  log "Backend: build"
  run npm --prefix "${BACKEND_DIR}" run build

  log "PM2: restart roodi-backend"
  pm2_restart_app "roodi-backend"
}

rebuild_admin() {
  log "Frontend-admin: deps"
  npm_install "${ADMIN_DIR}"

  log "Frontend-admin: build"
  run npm --prefix "${ADMIN_DIR}" run build

  log "PM2: restart roodi-admin"
  pm2_restart_app "roodi-admin"
}

rebuild_landing() {
  log "Landing: deps"
  npm_install "${LANDING_DIR}"

  log "Landing: build"
  run npm --prefix "${LANDING_DIR}" run build

  log "PM2: restart roodi-landing"
  pm2_restart_app "roodi-landing"
}

main() {
  ensure_paths
  ensure_mode
  need_cmd node
  need_cmd npm

  log "Repo: ${APP_DIR}"
  log "Modo: ${MODE} | pull=${DO_PULL} | skip_install=${SKIP_INSTALL}"

  git_pull_ff_only
  validate_workdir_matches_pm2
  ensure_env_symlinks

  case "${MODE}" in
    backend)
      rebuild_backend
      ;;
    admin)
      rebuild_admin
      ;;
    landing)
      rebuild_landing
      ;;
    all)
      rebuild_backend
      rebuild_admin
      rebuild_landing
      ;;
    *)
      fail "Modo invalido: ${MODE}"
      ;;
  esac

  log "OK (${MODE})."
}

main
