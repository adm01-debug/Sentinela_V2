## Causa

7 edge functions consultavam tabelas que **nao existem** no banco:

- `violations` (5 funcoes: generate-insights, natural-language-query, smart-recommendations, summarize-activity, trend-forecasting) — a tabela real e `security_violations`.
- `activities` / `activity_logs` (6 funcoes) — nao existem em nenhuma migration nem em `docs/prod-readiness.md`. A fonte real de atividade e `keystroke_logs`.

Efeito em producao: `PGRST205 Could not find the table` -> as funcoes respondiam 500 e as telas de IA/anomalia/sumario/forecast ficavam vazias.

## O que mudou

| Funcao                 | `violations`             | `activities`/`activity_logs`                                        |
| ---------------------- | ------------------------ | ------------------------------------------------------------------- |
| generate-insights      | -> `security_violations` | -> `keystroke_logs`                                                 |
| natural-language-query | -> `security_violations` | -> `keystroke_logs` (busca por `app_name`/`employee_name`/`device`) |
| smart-recommendations  | -> `security_violations` | -> `keystroke_logs`                                                 |
| summarize-activity     | -> `security_violations` | -> `keystroke_logs`                                                 |
| trend-forecasting      | -> `security_violations` | -> `keystroke_logs`                                                 |
| behavior-pattern       | —                        | -> `keystroke_logs`                                                 |
| predict-anomaly        | —                        | -> `keystroke_logs`                                                 |

Mapeamento de colunas para o schema real de `keystroke_logs` (`employee_name`, `app_name`, `active_time_seconds`, `idle_time_seconds`, `recorded_at`):

- `employee_id` / `user_id` -> `employee_name` (a tabela nao tem FK de usuario).
- `productivity_score` -> calculado como `active_time_seconds / (active_time_seconds + idle_time_seconds) * 100`.
- `metadata.application` / `metadata.app_name` / `entity_type` -> `app_name`.
- `created_at` -> `recorded_at` (mantendo fallback para `created_at`).
- `activities.productivity_score` em `trend-forecasting` -> mesma formula sobre `active_time_seconds`/`idle_time_seconds`.

Tambem removidas 3 variaveis mortas (`entityType`, `entityId`, `teamId`) que o `lint-staged` bloqueava, sem mudanca de comportamento (nunca eram usadas no corpo).

## Verificado

- `npx tsc --noEmit -p tsconfig.json` -> RC=0.
- `npx tsc --noEmit` isolado nas 7 funcoes -> 0 erros (só `TS2307`/`Deno` de import remoto, esperado fora do runtime Deno).
- `node scripts/ci/lint-ratchet.mjs` -> `novas=0`.
- `node scripts/ci/format-ratchet.mjs` -> `nenhum arquivo novo fora do padrao`.
- `npx vitest run` -> **69 arquivos, 1794 testes, todos passando**.
- `grep` por `.from("violations")` e `.from("activities")` em `supabase/functions` -> 0 ocorrencias.

## Nao verificado

- Execucao real das funcoes em producao (depende do deploy pos-merge).
