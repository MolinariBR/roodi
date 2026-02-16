#!/usr/bin/env bash
#
# Roodi - One file provision + deploy (Ubuntu 24.04)
# Usage (run inside the cloned repo directory):
#   bash scripts/roodi-onefile-deploy.sh --email you@example.com
#
# Optional env vars:
#   ROODI_APP_DIR=/opt/roodi/app                # where the repo lives on the server
#   ROODI_DOMAIN_API=api.roodi.app
#   ROODI_DOMAIN_ADMIN=admin.roodi.app
#   ROODI_DOMAIN_LANDING=roodi.app
#   ROODI_ENABLE_SSL=1                          # run certbot (default: 1)
#   ROODI_DB_NAME=roodi
#   ROODI_DB_USER=roodi
#   ROODI_DB_PASSWORD=...                       # if missing, generated once and stored in /opt/roodi/shared/created-secrets.txt
#
# What it does:
# 1) Installs system deps (nginx/certbot/node/pm2/postgres/redis)
# 2) Creates DB/user (idempotent)
# 3) Creates .env.production for Backend/Admin/Landing if missing (idempotent)
# 4) Writes PM2 ecosystem file and starts/reloads apps
# 5) Writes Nginx vhost configs and (optionally) issues SSL certificates
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ "${EUID}" -ne 0 ]]; then
  echo "ERROR: rode como root (ex.: sudo -i e execute novamente)." >&2
  exit 1
fi

EMAIL=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --email)
      EMAIL="${2:-}"
      shift 2
      ;;
    --help|-h)
      sed -n '1,80p' "$0"
      exit 0
      ;;
    *)
      echo "ERROR: opcao invalida: $1" >&2
      exit 1
      ;;
  esac
done

ROODI_APP_DIR="${ROODI_APP_DIR:-/opt/roodi/app}"
ROODI_SHARED_DIR="${ROODI_SHARED_DIR:-/opt/roodi/shared}"
ROODI_DOMAIN_API="${ROODI_DOMAIN_API:-api.roodi.app}"
ROODI_DOMAIN_ADMIN="${ROODI_DOMAIN_ADMIN:-admin.roodi.app}"
ROODI_DOMAIN_LANDING="${ROODI_DOMAIN_LANDING:-roodi.app}"
ROODI_ENABLE_SSL="${ROODI_ENABLE_SSL:-1}"

ROODI_DB_NAME="${ROODI_DB_NAME:-roodi}"
ROODI_DB_USER="${ROODI_DB_USER:-roodi}"
ROODI_DB_PASSWORD="${ROODI_DB_PASSWORD:-}"

PM2_ECOSYSTEM_FILE="${PM2_ECOSYSTEM_FILE:-/opt/roodi/ecosystem.config.cjs}"

BACKEND_DIR="${ROODI_APP_DIR}/Packages/Backend"
ADMIN_DIR="${ROODI_APP_DIR}/Packages/Frontend-admin"
LANDING_DIR="${ROODI_APP_DIR}/Packages/Roodi"

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
fail() { log "ERROR: $*"; exit 1; }

need() {
  command -v "$1" >/dev/null 2>&1 || fail "comando ausente: $1"
}

rand_hex() {
  # 32 bytes -> 64 hex chars
  openssl rand -hex 32
}

ensure_dirs() {
  mkdir -p "${ROODI_SHARED_DIR}/logs" "${ROODI_SHARED_DIR}/backups"
  chmod 700 "${ROODI_SHARED_DIR}" || true
}

ensure_repo_location() {
  if [[ "${REPO_DIR}" != "${ROODI_APP_DIR}" ]]; then
    log "Repo atual: ${REPO_DIR}"
    log "Movendo para ${ROODI_APP_DIR} (idempotente)"
    mkdir -p "$(dirname "${ROODI_APP_DIR}")"
    if [[ -d "${ROODI_APP_DIR}/.git" ]]; then
      log "Destino ja contem um repo. Usando ${ROODI_APP_DIR} como fonte."
    else
      rm -rf "${ROODI_APP_DIR}"
      mkdir -p "${ROODI_APP_DIR}"
      # Preserve .git and permissions; fastest is rsync
      if command -v rsync >/dev/null 2>&1; then
        rsync -a --delete "${REPO_DIR}/" "${ROODI_APP_DIR}/"
      else
        cp -a "${REPO_DIR}/." "${ROODI_APP_DIR}/"
      fi
    fi
  fi
}

install_system_deps() {
  log "Instalando dependencias do sistema (apt)"
  export DEBIAN_FRONTEND=noninteractive

  apt-get update -y
  apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg git \
    nginx \
    certbot python3-certbot-nginx \
    redis-server \
    postgresql postgresql-contrib \
    openssl

  # Node.js 20 LTS (NodeSource)
  if ! command -v node >/dev/null 2>&1; then
    log "Instalando Node.js 20 (NodeSource)"
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
      > /etc/apt/sources.list.d/nodesource.list
    apt-get update -y
    apt-get install -y nodejs
  fi

  # PM2
  if ! command -v pm2 >/dev/null 2>&1; then
    log "Instalando PM2 global"
    npm install -g pm2
  fi

  systemctl enable --now nginx
  systemctl enable --now redis-server
  systemctl enable --now postgresql
}

ensure_postgres_db_user() {
  log "Configurando PostgreSQL (db/user) - idempotente"
  need psql

  if [[ -z "${ROODI_DB_PASSWORD}" ]]; then
    local secrets_file="${ROODI_SHARED_DIR}/created-secrets.txt"
    if [[ -f "${secrets_file}" ]]; then
      ROODI_DB_PASSWORD="$(rg -n '^ROODI_DB_PASSWORD=' "${secrets_file}" | head -n1 | sed 's/^ROODI_DB_PASSWORD=//')"
    fi
  fi

  if [[ -z "${ROODI_DB_PASSWORD}" ]]; then
    ROODI_DB_PASSWORD="$(rand_hex)"
    {
      echo "ROODI_DB_USER=${ROODI_DB_USER}"
      echo "ROODI_DB_PASSWORD=${ROODI_DB_PASSWORD}"
      echo "ROODI_DB_NAME=${ROODI_DB_NAME}"
    } >> "${ROODI_SHARED_DIR}/created-secrets.txt"
    chmod 600 "${ROODI_SHARED_DIR}/created-secrets.txt" || true
  fi

  # Create role if missing (works in a transaction).
  local role_exists
  role_exists="$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${ROODI_DB_USER}'" | tr -d '[:space:]' || true)"
  if [[ "${role_exists}" != "1" ]]; then
    sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE ROLE ${ROODI_DB_USER} LOGIN PASSWORD '${ROODI_DB_PASSWORD}';"
  fi

  # Create database if missing (CREATE DATABASE cannot run inside DO/transaction).
  local db_exists
  db_exists="$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${ROODI_DB_NAME}'" | tr -d '[:space:]' || true)"
  if [[ "${db_exists}" != "1" ]]; then
    sudo -u postgres createdb -O "${ROODI_DB_USER}" "${ROODI_DB_NAME}"
  fi
}

write_env_if_missing() {
  local file_path="$1"
  local content="$2"
  if [[ -f "${file_path}" ]]; then
    log "Mantendo ${file_path} (ja existe)"
    return 0
  fi
  log "Criando ${file_path}"
  umask 077
  cat > "${file_path}" <<EOF
${content}
EOF
}

ensure_env_files() {
  log "Garantindo .env.production (idempotente)"
  local jwt_access
  local jwt_refresh
  jwt_access="$(rand_hex)"
  jwt_refresh="$(rand_hex)"

  # Backend .env.production
  write_env_if_missing "${BACKEND_DIR}/.env.production" "\
NODE_ENV=production
PORT=3333
API_VERSION=1.0.0
APP_VERSION=1.0.0
LOG_LEVEL=info
REQUEST_TIMEOUT_MS=10000
SENTRY_DSN=
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=
ADMIN_WEB_URL=https://${ROODI_DOMAIN_ADMIN}
LANDING_WEB_URL=https://${ROODI_DOMAIN_LANDING}
CORS_ALLOWED_ORIGINS=https://${ROODI_DOMAIN_ADMIN},https://${ROODI_DOMAIN_LANDING}
DATABASE_URL=postgresql://${ROODI_DB_USER}:${ROODI_DB_PASSWORD}@localhost:5432/${ROODI_DB_NAME}?schema=public
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=roodi:prod
JWT_ISSUER=roodi.app
JWT_AUDIENCE=roodi-api
JWT_ACCESS_SECRET=${jwt_access}
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=${jwt_refresh}
JWT_REFRESH_EXPIRES_IN=30d
AUTH_PASSWORD_HASH_ALGORITHM=bcrypt
AUTH_PASSWORD_HASH_ROUNDS=12
OTP_CODE_LENGTH=6
OTP_EXPIRES_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60
RESEND_API_BASE_URL=https://api.resend.com
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_REPLY_TO=
TOMTOM_API_KEY=
OPENROUTESERVICE_API_KEY=
OPENWEATHER_API_KEY=
MET_NO_BASE_URL=https://api.met.no/weatherapi/locationforecast/2.0/compact
GOOGLE_MAPS_API_KEY=
INFINITEPAY_API_BASE_URL=https://api.infinitepay.io
INFINITEPAY_API_KEY=
INFINITEPAY_HANDLE=
INFINITEPAY_WEBHOOK_SECRET=
INFINITEPAY_WEBHOOK_URL=https://${ROODI_DOMAIN_API}/v1/payments/infinitepay/webhook"

  # Para evitar falhas acidentais de comandos que assumem "development",
  # mantemos `.env.development` como symlink para `.env.production` no servidor.
  if [[ ! -f "${BACKEND_DIR}/.env.development" ]]; then
    ln -sf "${BACKEND_DIR}/.env.production" "${BACKEND_DIR}/.env.development"
  fi

  # Centralizacao: admin e landing leem do mesmo arquivo do backend via symlink.
  ln -sf "${BACKEND_DIR}/.env.production" "${ADMIN_DIR}/.env.production"
  ln -sf "${BACKEND_DIR}/.env.production" "${LANDING_DIR}/.env.production"
}

ensure_pm2_ecosystem() {
  log "Gerando PM2 ecosystem: ${PM2_ECOSYSTEM_FILE}"
  mkdir -p "$(dirname "${PM2_ECOSYSTEM_FILE}")"
  cat > "${PM2_ECOSYSTEM_FILE}" <<EOF
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

write_nginx_site() {
  local file_path="$1"
  local content="$2"
  cat > "${file_path}" <<EOF
${content}
EOF
}

ensure_nginx() {
  log "Configurando Nginx (HTTP) - idempotente"

  local api_conf="/etc/nginx/sites-available/${ROODI_DOMAIN_API}.conf"
  local admin_conf="/etc/nginx/sites-available/${ROODI_DOMAIN_ADMIN}.conf"
  local landing_conf="/etc/nginx/sites-available/${ROODI_DOMAIN_LANDING}.conf"

  write_nginx_site "${api_conf}" "\
server {
  listen 80;
  listen [::]:80;
  server_name ${ROODI_DOMAIN_API};

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
  server_name ${ROODI_DOMAIN_ADMIN};

  client_max_body_size 10m;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;

    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;

    proxy_read_timeout 60s;
    proxy_send_timeout 60s;
  }
}"

  write_nginx_site "${landing_conf}" "\
server {
  listen 80;
  listen [::]:80;
  server_name ${ROODI_DOMAIN_LANDING} www.${ROODI_DOMAIN_LANDING};

  client_max_body_size 10m;

  location / {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;

    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;

    proxy_read_timeout 60s;
    proxy_send_timeout 60s;
  }
}"

  ln -sf "${api_conf}" "/etc/nginx/sites-enabled/${ROODI_DOMAIN_API}.conf"
  ln -sf "${admin_conf}" "/etc/nginx/sites-enabled/${ROODI_DOMAIN_ADMIN}.conf"
  ln -sf "${landing_conf}" "/etc/nginx/sites-enabled/${ROODI_DOMAIN_LANDING}.conf"

  nginx -t
  systemctl reload nginx
}

ensure_ssl() {
  if [[ "${ROODI_ENABLE_SSL}" != "1" ]]; then
    log "SSL desabilitado (ROODI_ENABLE_SSL=${ROODI_ENABLE_SSL})"
    return 0
  fi

  if [[ -z "${EMAIL}" ]]; then
    fail "Informe --email para Let's Encrypt (ex.: --email you@example.com) ou desabilite SSL com ROODI_ENABLE_SSL=0"
  fi

  log "Emitindo certificados SSL via certbot"
  certbot --nginx \
    -m "${EMAIL}" --agree-tos --non-interactive \
    -d "${ROODI_DOMAIN_API}" \
    -d "${ROODI_DOMAIN_ADMIN}" \
    -d "${ROODI_DOMAIN_LANDING}" \
    -d "www.${ROODI_DOMAIN_LANDING}"

  systemctl enable --now certbot.timer || true
}

install_and_build() {
  log "Instalando dependencias NPM"
  npm --prefix "${ROODI_APP_DIR}" install
  npm --prefix "${BACKEND_DIR}" install --include=dev
  npm --prefix "${ADMIN_DIR}" install --include=dev
  npm --prefix "${LANDING_DIR}" install --include=dev

  log "Migrations (backend)"
  ROODI_ENV=production npm --prefix "${BACKEND_DIR}" run db:migrate

  log "Build (backend/admin/landing)"
  npm --prefix "${BACKEND_DIR}" run build
  npm --prefix "${ADMIN_DIR}" run build
  npm --prefix "${LANDING_DIR}" run build
}

start_pm2() {
  log "Subindo apps com PM2"
  pm2 startOrReload "${PM2_ECOSYSTEM_FILE}" --update-env
  pm2 save
  pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true
}

healthcheck() {
  log "Healthcheck (API)"
  curl -fsS "http://127.0.0.1:3333/health" >/dev/null
  log "OK: backend local responde /health"
}

main() {
  ensure_dirs
  install_system_deps

  # ripgrep used only to re-read secrets if needed; install minimal
  if ! command -v rg >/dev/null 2>&1; then
    apt-get install -y ripgrep
  fi

  ensure_repo_location

  [[ -d "${BACKEND_DIR}" ]] || fail "backend nao encontrado em ${BACKEND_DIR}"
  [[ -d "${ADMIN_DIR}" ]] || fail "frontend-admin nao encontrado em ${ADMIN_DIR}"
  [[ -d "${LANDING_DIR}" ]] || fail "landing nao encontrada em ${LANDING_DIR}"

  ensure_postgres_db_user
  ensure_env_files
  ensure_pm2_ecosystem
  install_and_build
  start_pm2
  ensure_nginx
  ensure_ssl
  healthcheck

  log "Concluido."
  log "Dominios:"
  log "  API:    https://${ROODI_DOMAIN_API}"
  log "  Admin:  https://${ROODI_DOMAIN_ADMIN}"
  log "  Site:   https://${ROODI_DOMAIN_LANDING}"
  log "Se geramos senha do banco: ${ROODI_SHARED_DIR}/created-secrets.txt (permissoes 600)."
}

main
