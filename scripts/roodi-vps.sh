#!/usr/bin/env bash
#
# ROODI - VPS Bootstrap + Deploy (single script)
# Target: Ubuntu 24.04
#
# Run inside the cloned repo directory (recommended path: /opt/roodi/app):
#   sudo bash scripts/roodi-vps.sh --email you@example.com
#
# Options:
#   --email <email>           Email for Let's Encrypt (required unless --skip-ssl)
#   --skip-ssl                Skip certbot/SSL
#   --skip-ufw                Skip firewall changes
#   --skip-swap               Skip swap creation
#   --skip-apt                Skip apt install/update (assumes deps already installed)
#   --self-test               Local dry-run test (does NOT touch system)
#
set -Eeuo pipefail
IFS=$'\n\t'

SELF_TEST="false"
SKIP_SSL="false"
SKIP_UFW="false"
SKIP_SWAP="false"
SKIP_APT="false"
EMAIL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --email)
      EMAIL="${2:-}"
      shift 2
      ;;
    --skip-ssl)
      SKIP_SSL="true"
      shift
      ;;
    --skip-ufw)
      SKIP_UFW="true"
      shift
      ;;
    --skip-swap)
      SKIP_SWAP="true"
      shift
      ;;
    --skip-apt)
      SKIP_APT="true"
      shift
      ;;
    --self-test)
      SELF_TEST="true"
      SKIP_SSL="true"
      SKIP_UFW="true"
      SKIP_SWAP="true"
      SKIP_APT="true"
      shift
      ;;
    --help|-h)
      sed -n '1,120p' "$0"
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
  command -v "$1" >/dev/null 2>&1 || fail "Comando ausente: $1"
}

repo_root() {
  if [[ "${SELF_TEST}" == "true" ]]; then
    echo "$(cd "$(dirname "$0")/.." && pwd)"
    return 0
  fi
  git rev-parse --show-toplevel 2>/dev/null || fail "Execute o script dentro do repositorio (git)."
}

APP_DIR="$(repo_root)"
BACKEND_DIR="${APP_DIR}/Packages/Backend"
ADMIN_DIR="${APP_DIR}/Packages/Frontend-admin"
LANDING_DIR="${APP_DIR}/Packages/Roodi"

SHARED_DIR="/opt/roodi/shared"
ECOSYSTEM_FILE="/opt/roodi/ecosystem.config.cjs"

DOMAIN_API="api.roodi.app"
DOMAIN_ADMIN="admin.roodi.app"
DOMAIN_LANDING="roodi.app"

BACKEND_ENV_FILE="${BACKEND_DIR}/.env.production"

ensure_root() {
  if [[ "${SELF_TEST}" == "true" ]]; then
    return 0
  fi
  if [[ "${EUID}" -ne 0 ]]; then
    fail "Rode como root: sudo bash scripts/roodi-vps.sh ..."
  fi
}

ensure_paths() {
  [[ -d "${BACKEND_DIR}" ]] || fail "Backend nao encontrado: ${BACKEND_DIR}"
  [[ -d "${ADMIN_DIR}" ]] || fail "Frontend-admin nao encontrado: ${ADMIN_DIR}"
  [[ -d "${LANDING_DIR}" ]] || fail "Landing nao encontrada: ${LANDING_DIR}"
  [[ -f "${BACKEND_ENV_FILE}" ]] || fail "Env nao encontrado: ${BACKEND_ENV_FILE}"
}

read_env_value() {
  local file_path="$1"
  local key="$2"
  grep -m1 "^${key}=" "${file_path}" | cut -d= -f2- || true
}

validate_env() {
  local db_url
  db_url="$(read_env_value "${BACKEND_ENV_FILE}" "DATABASE_URL")"
  [[ -n "${db_url}" ]] || fail "DATABASE_URL vazio em ${BACKEND_ENV_FILE}"
  if [[ "${db_url}" == *"<user>"* || "${db_url}" == *"<password>"* || "${db_url}" == *"<host>"* ]]; then
    fail "DATABASE_URL contem placeholders em ${BACKEND_ENV_FILE}"
  fi
  if [[ "${db_url}" == *"ROODI_DB_PASSWORD="* ]]; then
    fail "DATABASE_URL corrompido (ROODI_DB_PASSWORD=) em ${BACKEND_ENV_FILE}"
  fi
  local redis_url
  redis_url="$(read_env_value "${BACKEND_ENV_FILE}" "REDIS_URL")"
  [[ -n "${redis_url}" ]] || fail "REDIS_URL vazio em ${BACKEND_ENV_FILE}"
}

install_system_deps() {
  if [[ "${SKIP_APT}" == "true" ]]; then
    log "SKIP: apt"
    return 0
  fi

  # Avoid apt-get if everything is already installed.
  local missing="false"
  for cmd in curl git nginx certbot psql redis-server openssl node npm; do
    if ! command -v "${cmd}" >/dev/null 2>&1; then
      missing="true"
      break
    fi
  done
  if [[ "${missing}" == "false" ]] && command -v pm2 >/dev/null 2>&1; then
    log "Dependencias ja instaladas. Pulando apt-get."
    return 0
  fi

  log "Instalando dependencias do sistema (apt)"
  export DEBIAN_FRONTEND=noninteractive
  run apt-get update -y
  run apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg git \
    nginx \
    certbot python3-certbot-nginx \
    redis-server \
    postgresql postgresql-contrib \
    openssl \
    python3 \
    rsync

  # Node 20 (NodeSource) if missing
  if ! command -v node >/dev/null 2>&1; then
    log "Instalando Node.js 20 (NodeSource)"
    run install -m 0755 -d /etc/apt/keyrings
    run bash -lc 'curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg'
    run bash -lc 'echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list'
    run apt-get update -y
    run apt-get install -y nodejs
  fi

  if ! command -v pm2 >/dev/null 2>&1; then
    log "Instalando PM2 global"
    run npm install -g pm2
  fi

  run systemctl enable --now nginx
  run systemctl enable --now redis-server
  run systemctl enable --now postgresql
}

ensure_swap() {
  if [[ "${SKIP_SWAP}" == "true" ]]; then
    log "SKIP: swap"
    return 0
  fi
  if [[ "${SELF_TEST}" == "true" ]]; then
    log "DRY-RUN: swap check"
    return 0
  fi

  if swapon --show | rg -q '^/swapfile' 2>/dev/null; then
    log "Swap ja configurado (/swapfile)"
    return 0
  fi

  # Create 2GB swap for 1vCPU/2GB droplets (safety).
  log "Criando swapfile 2G em /swapfile"
  run fallocate -l 2G /swapfile || run dd if=/dev/zero of=/swapfile bs=1M count=2048
  run chmod 600 /swapfile
  run mkswap /swapfile
  run swapon /swapfile
  if ! grep -q '^/swapfile ' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
}

ensure_ufw() {
  if [[ "${SKIP_UFW}" == "true" ]]; then
    log "SKIP: ufw"
    return 0
  fi
  if [[ "${SELF_TEST}" == "true" ]]; then
    log "DRY-RUN: ufw allow 22/80/443"
    return 0
  fi
  if ! command -v ufw >/dev/null 2>&1; then
    run apt-get update -y
    run apt-get install -y ufw
  fi
  run ufw allow OpenSSH
  run ufw allow 80/tcp
  run ufw allow 443/tcp
  run ufw --force enable
}

parse_database_url() {
  local db_url="$1"
  python3 - "${db_url}" <<'PY'
from urllib.parse import urlparse, unquote
import sys
u = urlparse(sys.argv[1])
user = unquote(u.username or "")
pw = unquote(u.password or "")
host = u.hostname or ""
port = str(u.port or 5432)
db = (u.path or "").lstrip("/")
print("|".join([user, pw, host, port, db]))
PY
}

ensure_postgres_from_env() {
  local db_url
  db_url="$(read_env_value "${BACKEND_ENV_FILE}" "DATABASE_URL")"
  local parsed
  parsed="$(parse_database_url "${db_url}")"
  local db_user db_pass db_host db_port db_name
  IFS='|' read -r db_user db_pass db_host db_port db_name <<< "${parsed}"
  [[ -n "${db_user}" && -n "${db_pass}" && -n "${db_name}" ]] || fail "DATABASE_URL invalido (faltando user/pass/db)."

  # Only provision local postgres. If remote, skip creation.
  if [[ "${db_host}" != "localhost" && "${db_host}" != "127.0.0.1" && "${db_host}" != "" ]]; then
    log "PostgreSQL remoto detectado (${db_host}). Pulando create role/db."
    return 0
  fi

  if [[ "${SELF_TEST}" == "true" ]]; then
    log "DRY-RUN: provision postgres user=${db_user} db=${db_name}"
    return 0
  fi

  need_cmd psql
  log "Configurando PostgreSQL (role/db) a partir do DATABASE_URL"

  local role_exists
  role_exists="$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${db_user}'" | tr -d '[:space:]' || true)"
  if [[ "${role_exists}" != "1" ]]; then
    run sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE ROLE ${db_user} LOGIN PASSWORD '${db_pass}';"
  else
    run sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER ROLE ${db_user} WITH PASSWORD '${db_pass}';"
  fi

  local db_exists
  db_exists="$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${db_name}'" | tr -d '[:space:]' || true)"
  if [[ "${db_exists}" != "1" ]]; then
    run sudo -u postgres createdb -O "${db_user}" "${db_name}"
  fi
}

ensure_env_symlinks() {
  log "Symlinks de env (admin/landing -> backend)"
  run ln -sf "${BACKEND_ENV_FILE}" "${ADMIN_DIR}/.env.production"
  run ln -sf "${BACKEND_ENV_FILE}" "${LANDING_DIR}/.env.production"
}

npm_install() {
  local dir="$1"
  if [[ -f "${dir}/package-lock.json" ]]; then
    run npm --prefix "${dir}" ci
  else
    run npm --prefix "${dir}" install
  fi
}

backend_migrate_generate_build() {
  log "Backend: deps"
  npm_install "${BACKEND_DIR}"

  log "Backend: migrate"
  run ROODI_ENV=production npm --prefix "${BACKEND_DIR}" run db:migrate

  log "Backend: prisma generate"
  run bash -lc "cd \"${BACKEND_DIR}\" && npx prisma generate --schema prisma/schema.prisma"

  log "Backend: build"
  run npm --prefix "${BACKEND_DIR}" run build
}

admin_build() {
  log "Frontend-admin: deps"
  npm_install "${ADMIN_DIR}"
  log "Frontend-admin: build"
  run npm --prefix "${ADMIN_DIR}" run build
}

landing_build() {
  log "Landing: deps"
  npm_install "${LANDING_DIR}"
  log "Landing: build"
  run npm --prefix "${LANDING_DIR}" run build
}

write_pm2_ecosystem() {
  log "PM2: escrever ecosystem em ${ECOSYSTEM_FILE}"
  if [[ "${SELF_TEST}" == "true" ]]; then
    log "DRY-RUN: write pm2 ecosystem"
    return 0
  fi

  mkdir -p "$(dirname "${ECOSYSTEM_FILE}")"
  cat > "${ECOSYSTEM_FILE}" <<EOF
module.exports = {
  apps: [
    {
      name: "roodi-backend",
      cwd: "${BACKEND_DIR}",
      script: "dist/src/main.js",
      interpreter: "node",
      env: { NODE_ENV: "production" },
    },
    {
      name: "roodi-admin",
      cwd: "${ADMIN_DIR}",
      script: "npm",
      args: "run start",
      env: { NODE_ENV: "production" },
    },
    {
      name: "roodi-landing",
      cwd: "${LANDING_DIR}",
      script: "npm",
      args: "run start",
      env: { NODE_ENV: "production" },
    },
  ],
};
EOF
}

pm2_up() {
  log "PM2: startOrReload"
  if [[ "${SELF_TEST}" == "true" ]]; then
    log "DRY-RUN: pm2 startOrReload"
    return 0
  fi
  need_cmd pm2
  run pm2 startOrReload "${ECOSYSTEM_FILE}" --update-env
  run pm2 save
  run pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true
}

write_nginx_site() {
  local file_path="$1"
  local content="$2"
  if [[ "${SELF_TEST}" == "true" ]]; then
    log "DRY-RUN: write nginx ${file_path}"
    return 0
  fi
  cat > "${file_path}" <<EOF
${content}
EOF
}

nginx_configure() {
  log "Nginx: configurar vhosts"
  local api_conf="/etc/nginx/sites-available/${DOMAIN_API}.conf"
  local admin_conf="/etc/nginx/sites-available/${DOMAIN_ADMIN}.conf"
  local landing_conf="/etc/nginx/sites-available/${DOMAIN_LANDING}.conf"

  write_nginx_site "${api_conf}" "\
server {
  listen 80;
  listen [::]:80;
  server_name ${DOMAIN_API};
  client_max_body_size 20m;
  location / {
    proxy_pass http://127.0.0.1:3333;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \"upgrade\";
    proxy_read_timeout 90s;
    proxy_send_timeout 90s;
  }
}"

  write_nginx_site "${admin_conf}" "\
server {
  listen 80;
  listen [::]:80;
  server_name ${DOMAIN_ADMIN};
  client_max_body_size 10m;
  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}"

  write_nginx_site "${landing_conf}" "\
server {
  listen 80;
  listen [::]:80;
  server_name ${DOMAIN_LANDING} www.${DOMAIN_LANDING};
  client_max_body_size 10m;
  location / {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}"

  if [[ "${SELF_TEST}" == "true" ]]; then
    log "DRY-RUN: nginx -t && systemctl reload nginx"
    return 0
  fi

  # Disable the default site to avoid accidental vhost precedence issues.
  rm -f /etc/nginx/sites-enabled/default || true

  run ln -sf "${api_conf}" "/etc/nginx/sites-enabled/${DOMAIN_API}.conf"
  run ln -sf "${admin_conf}" "/etc/nginx/sites-enabled/${DOMAIN_ADMIN}.conf"
  run ln -sf "${landing_conf}" "/etc/nginx/sites-enabled/${DOMAIN_LANDING}.conf"

  run nginx -t
  run systemctl reload nginx
}

ssl_configure() {
  if [[ "${SKIP_SSL}" == "true" ]]; then
    log "SKIP: ssl"
    return 0
  fi
  [[ -n "${EMAIL}" ]] || fail "--email obrigatorio para SSL (LetsEncrypt)."
  if [[ "${SELF_TEST}" == "true" ]]; then
    log "DRY-RUN: certbot --nginx ..."
    return 0
  fi
  log "SSL: certbot"
  run certbot --nginx \
    -m "${EMAIL}" --agree-tos --non-interactive \
    -d "${DOMAIN_API}" \
    -d "${DOMAIN_ADMIN}" \
    -d "${DOMAIN_LANDING}" \
    -d "www.${DOMAIN_LANDING}"
  run systemctl enable --now certbot.timer || true
}

healthchecks() {
  log "Healthcheck: backend local /health"
  if [[ "${SELF_TEST}" == "true" ]]; then
    log "DRY-RUN: curl http://127.0.0.1:3333/health"
    return 0
  fi
  run curl -fsS "http://127.0.0.1:3333/health" >/dev/null
}

main() {
  ensure_root
  ensure_paths
  validate_env

  run mkdir -p "${SHARED_DIR}/logs" "${SHARED_DIR}/backups"

  install_system_deps
  ensure_swap
  ensure_ufw

  ensure_postgres_from_env
  ensure_env_symlinks

  # Workspace deps (lint tools) live at repo root.
  log "Workspace: deps"
  npm_install "${APP_DIR}"

  backend_migrate_generate_build
  admin_build
  landing_build

  write_pm2_ecosystem
  pm2_up

  nginx_configure
  ssl_configure
  healthchecks

  log "OK. URLs:"
  log "  API:   https://${DOMAIN_API}"
  log "  Admin: https://${DOMAIN_ADMIN}"
  log "  Site:  https://${DOMAIN_LANDING}"
}

main
