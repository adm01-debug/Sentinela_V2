#!/usr/bin/env bash
# Repete um comando do Supabase CLI quando a falha for transitoria.
#
# A API do Supabase (api.supabase.com, atras do Cloudflare) responde 5xx
# transitorio: em 261124 o deploy de edge functions morreu com
# "Error 502: Bad gateway" + "retryable": true + "retry_after": 60 (run
# 45439664403) e so passou no rerun. Erro de token, validacao ou bundling NAO
# entra nessa lista de proposito: repetir mascararia problema real.
#
# Uso:  bash scripts/lib/supabase-retry.sh <comando> [args...]
# Env:  MAX_TENTATIVAS (padrao 3), ESPERA_PADRAO (padrao 60)
set -uo pipefail

if [ "$#" -eq 0 ]; then
  echo "uso: $0 <comando> [args...]" >&2
  exit 2
fi

max_tentativas="${MAX_TENTATIVAS:-3}"
espera_padrao="${ESPERA_PADRAO:-60}"
padrao_transitorio='retryable|502|503|504|522|525|bad gateway|gateway time-?out|internal server error|econnreset|etimedout|socket hang up|timed out'

log=$(mktemp)
trap 'rm -f "$log"' EXIT

tentativa=1
while [ "$tentativa" -le "$max_tentativas" ]; do
  set +e
  "$@" >"$log" 2>&1
  status=$?
  set -e
  cat "$log"

  if [ "$status" -eq 0 ]; then
    echo "OK na tentativa $tentativa."
    exit 0
  fi

  ocorrencias=$(grep -Eic "$padrao_transitorio" "$log" || true)
  if [ "${ocorrencias:-0}" -eq 0 ]; then
    echo "::error::Falha nao transitoria (tentativa $tentativa); sem retry."
    exit "$status"
  fi

  if [ "$tentativa" -eq "$max_tentativas" ]; then
    echo "::error::Falha transitoria persistente do Supabase apos $max_tentativas tentativas."
    exit "$status"
  fi

  # A propria API diz quanto esperar ("retry_after": 60 no 502 do Cloudflare);
  # o pedido de backoff dela e o piso, nao um extra.
  espera=$espera_padrao
  informado=$(grep -oE '"retry_after":[[:space:]]*[0-9]+' "$log" | head -1 | grep -oE '[0-9]+' || true)
  if [ -n "$informado" ] && [ "$informado" -gt "$espera" ]; then
    espera=$informado
  fi
  echo "Falha transitoria na tentativa $tentativa; repetindo em ${espera}s..." >&2
  sleep "$espera"
  tentativa=$((tentativa + 1))
done