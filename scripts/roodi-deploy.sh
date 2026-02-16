#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

BACKEND_DIR="${ROOT_DIR}/Packages/Backend"
ADMIN_DIR="${ROOT_DIR}/Packages/Frontend-admin"
LANDING_DIR="${ROOT_DIR}/Packages/Roodi"

BRANCH="${ROODI_DEPLOY_BRANCH:-main}"
PM2_ECOSYSTEM_FILE="${PM2_ECOSYSTEM_FILE:-/opt/roodi/ecosystem.config.cjs}"
API_HEALTHCHECK_URL="${API_HEALTHCHECK_URL:-https://api.roodi.app/health}"
ADMIN_HEALTHCHECK_URL="${ADMIN_HEALTHCHECK_URL:-https://admin.roodi.app}"
LANDING_HEALTHCHECK_URL="${LANDING_HEALTHCHECK_URL:-https://roodi.app}"

SKIP_GIT_PULL="false"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

require_command() {
  local command_name="$1"
  command -v "${command_name}" >/dev/null 2>&1 || fail "Comando ausente: ${command_name}"
}

require_directory() {
  local dir_path="$1"
  [[ -d "${dir_path}" ]] || fail "Diretorio nao encontrado: ${dir_path}"
}

require_file() {
  local file_path="$1"
  [[ -f "${file_path}" ]] || fail "Arquivo nao encontrado: ${file_path}"
}

usage() {
  cat <<'EOF'
Uso:
  bash scripts/roodi-deploy.sh [opcoes]

Opcoes:
  --branch <nome>      Branch para deploy (padrao: main)
  --skip-git-pull      Nao executa fetch/checkout/pull
  --help               Exibe esta ajuda
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      [[ $# -ge 2 ]] || fail "Informe o nome da branch apos --branch"
      BRANCH="$2"
      shift 2
      ;;
    --skip-git-pull)
      SKIP_GIT_PULL="true"
      shift
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      fail "Opcao invalida: $1"
      ;;
  esac
done

require_command git
require_command npm
require_command pm2
require_command curl

require_directory "${ROOT_DIR}/.git"
require_directory "${BACKEND_DIR}"
require_directory "${ADMIN_DIR}"
require_directory "${LANDING_DIR}"

require_file "${BACKEND_DIR}/.env.production"
require_file "${PM2_ECOSYSTEM_FILE}"

if [[ -n "$(git -C "${ROOT_DIR}" status --porcelain --untracked-files=no)" ]]; then
  fail "Repositorio local com alteracoes nao commitadas. Commit/stash antes do deploy."
fi

log "Garantindo symlinks de env (admin/landing -> backend)"
ln -sf "${BACKEND_DIR}/.env.production" "${ADMIN_DIR}/.env.production"
ln -sf "${BACKEND_DIR}/.env.production" "${LANDING_DIR}/.env.production"

if [[ "${SKIP_GIT_PULL}" == "false" ]]; then
  log "Sincronizando codigo da branch ${BRANCH}"
  git -C "${ROOT_DIR}" fetch --all --prune
  git -C "${ROOT_DIR}" checkout "${BRANCH}"
  git -C "${ROOT_DIR}" pull --ff-only origin "${BRANCH}"
else
  log "Modo --skip-git-pull ativo: mantendo codigo local atual"
fi

log "Instalando dependencias"
npm --prefix "${ROOT_DIR}" install
npm --prefix "${BACKEND_DIR}" install --include=dev
npm --prefix "${ADMIN_DIR}" install --include=dev
npm --prefix "${LANDING_DIR}" install --include=dev

log "Executando migracoes de banco"
npm --prefix "${BACKEND_DIR}" run db:migrate

log "Gerando builds de producao"
npm --prefix "${BACKEND_DIR}" run build
npm --prefix "${ADMIN_DIR}" run build
npm --prefix "${LANDING_DIR}" run build

log "Atualizando processos PM2"
pm2 startOrReload "${PM2_ECOSYSTEM_FILE}" --update-env
pm2 save

log "Executando healthchecks"
curl -fsS "${API_HEALTHCHECK_URL}" >/dev/null
curl -IfsS "${ADMIN_HEALTHCHECK_URL}" >/dev/null
curl -IfsS "${LANDING_HEALTHCHECK_URL}" >/dev/null

log "Deploy concluido com sucesso."
