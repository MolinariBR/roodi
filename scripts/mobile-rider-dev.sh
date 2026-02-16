#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/Packages/Backend"
FRONTEND_RIDER_DIR="$ROOT_DIR/Packages/Frontend-rider"
TMP_DIR="$ROOT_DIR/.tmp"
BACKEND_LOG_FILE="$TMP_DIR/backend-dev.log"
BACKEND_PID_FILE="$TMP_DIR/backend-dev.pid"
HEALTHCHECK_URL="http://127.0.0.1:3333/health"

mkdir -p "$TMP_DIR"

log() {
  printf '[mobile-rider] %s\n' "$1"
}

ensure_backend_running() {
  if curl -fsS "$HEALTHCHECK_URL" >/dev/null 2>&1; then
    log "Backend já está ativo em 127.0.0.1:3333."
    return
  fi

  log "Backend indisponível. Iniciando npm run dev em Packages/Backend..."
  (
    cd "$BACKEND_DIR"
    nohup npm run dev >"$BACKEND_LOG_FILE" 2>&1 &
    echo $! >"$BACKEND_PID_FILE"
  )

  for _ in $(seq 1 30); do
    if curl -fsS "$HEALTHCHECK_URL" >/dev/null 2>&1; then
      log "Backend iniciado com sucesso."
      return
    fi
    sleep 1
  done

  log "Falha ao iniciar backend automaticamente."
  if [[ -f "$BACKEND_LOG_FILE" ]]; then
    log "Últimas linhas do log do backend:"
    tail -n 40 "$BACKEND_LOG_FILE" || true
  fi
  exit 1
}

ensure_adb_reverse() {
  if ! command -v adb >/dev/null 2>&1; then
    log "adb não encontrado no PATH. Conecte manualmente com IP da máquina em ROODI_API_BASE_URL."
    return
  fi

  if ! adb get-state >/dev/null 2>&1; then
    log "Nenhum dispositivo Android detectado via adb. Tentando seguir mesmo assim."
    return
  fi

  adb reverse tcp:3333 tcp:3333 >/dev/null
  log "adb reverse tcp:3333 -> tcp:3333 configurado."
}

run_flutter() {
  cd "$FRONTEND_RIDER_DIR"
  log "Iniciando Flutter com API em 127.0.0.1:3333..."
  flutter run --dart-define=ROODI_API_BASE_URL=http://127.0.0.1:3333 "$@"
}

ensure_backend_running
ensure_adb_reverse
run_flutter "$@"

