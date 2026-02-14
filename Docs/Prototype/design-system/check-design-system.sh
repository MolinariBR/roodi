#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-Docs/Prototype}"

if [[ ! -d "$ROOT_DIR" ]]; then
  echo "[ERROR] Diretório não encontrado: $ROOT_DIR"
  exit 2
fi

mapfile -t html_files < <(find "$ROOT_DIR" -type f -name '*.html' -size +0c | sort)
mapfile -t empty_html_files < <(find "$ROOT_DIR" -type f -name '*.html' -size 0c | sort)

if [[ ${#html_files[@]} -eq 0 ]]; then
  echo "[OK] Nenhuma tela HTML não-vazia encontrada em $ROOT_DIR"
  if [[ ${#empty_html_files[@]} -gt 0 ]]; then
    echo "[WARN] Existem arquivos HTML vazios:"
    printf '  - %s\n' "${empty_html_files[@]}"
  fi
  exit 0
fi

failed_files=0
issues=0

report_issue() {
  local file="$1"
  local label="$2"
  local details="$3"

  if [[ "${CURRENT_FILE_FAILED:-0}" -eq 0 ]]; then
    echo
    echo "[FAIL] $file"
    CURRENT_FILE_FAILED=1
    failed_files=$((failed_files + 1))
  fi

  issues=$((issues + 1))
  echo "  - $label"
  if [[ -n "$details" ]]; then
    printf '%s\n' "$details" | sed 's/^/      /'
  fi
}

check_pattern() {
  local file="$1"
  local label="$2"
  local pattern="$3"

  local matches
  matches="$(rg -n --no-heading -e "$pattern" "$file" || true)"
  if [[ -n "$matches" ]]; then
    report_issue "$file" "$label" "$matches"
  fi
}

for file in "${html_files[@]}"; do
  CURRENT_FILE_FAILED=0

  if ! rg -q 'design-system/tokens.css' "$file"; then
    report_issue "$file" "Import obrigatório ausente: tokens.css" ""
  fi

  if ! rg -q 'design-system/design.css' "$file"; then
    report_issue "$file" "Import obrigatório ausente: design.css" ""
  fi

  if ! rg -q 'design-system/tailwind-theme.js' "$file"; then
    report_issue "$file" "Import obrigatório ausente: tailwind-theme.js" ""
  fi

  check_pattern "$file" "Tailwind config inline (deve ser centralizado)" 'tailwind\.config\s*='
  check_pattern "$file" "Bloco <style> inline (deve estar no design.css)" '<style>'
  check_pattern "$file" "Atributo style inline (evitar hardcode)" 'style="'
  check_pattern "$file" "Classe Tailwind arbitrária detectada ([...])" '\[[^]]+\]'
  check_pattern "$file" "Cor hardcoded em classe Tailwind (bg-[#...], border-[#...], etc.)" '(?:bg|text|border|ring|from|to|via)-\[#'
  check_pattern "$file" "Sombra hardcoded com cor em classe Tailwind" 'shadow-\[[^]]*(?:#|rgba?\()'
  check_pattern "$file" "Cor hardcoded em atributos SVG/HTML" '(?:fill|stroke|stop-color)="#'
  check_pattern "$file" "Cor raw rgba()/rgb() no HTML" 'rgba?\('
done

if [[ ${#empty_html_files[@]} -gt 0 ]]; then
  echo
  echo "[WARN] Arquivos HTML vazios (ignorados na auditoria):"
  printf '  - %s\n' "${empty_html_files[@]}"
fi

echo
if [[ $failed_files -gt 0 ]]; then
  echo "[RESULT] REPROVADO"
  echo "  Telas com violação: $failed_files"
  echo "  Total de violações: $issues"
  exit 1
fi

echo "[RESULT] APROVADO"
echo "  Telas auditadas: ${#html_files[@]}"
if [[ ${#empty_html_files[@]} -gt 0 ]]; then
  echo "  Telas vazias ignoradas: ${#empty_html_files[@]}"
fi
