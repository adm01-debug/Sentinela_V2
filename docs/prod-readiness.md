# Sentinela_V2 — Prontidão de Produção

> Linha de base atualizada: main `9954e10a866` (após merges #130/#129). Documento vivo: cada item é OK (com prova) ou BLOQUEADO (com erro exato). Esta lista é a base de "sem perda de funcionalidade".

## 1. Qualidade (build/typecheck/lint/tests) — rodado local no main `b7c5ffa8` e confirmado no CI do main `9954e10a866`

| Gate                | Comando do CI                           | Resultado     | Evidência                                                                                           |
| ------------------- | --------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------- |
| Typecheck (ratchet) | `node scripts/ci/typecheck-ratchet.mjs` | **OK** exit 0 | baseline=0, atual=0, novas=0                                                                        |
| Lint (ratchet)      | `node scripts/ci/lint-ratchet.mjs`      | **OK** exit 0 | baseline=1334, atual=1325, novas=0 (9 ocorrências do baseline já pagas, aviso para baixar baseline) |
| Testes              | `npm test` (vitest run)                 | **OK** exit 0 | 1767 passed / 62 arquivos                                                                           |
| Build               | `npm run build`                         | **OK** exit 0 | vite build em 5.08s                                                                                 |

**Confirmação CI no main `9954e10a866`** (check-runs do commit real, via GitHub API): `lint` success, `build` success, `test` success, `quality` success, `deno-contract-tests` success, `agent-instructions-guard` success, CodeQL `Analyze (actions)` success, e `Gerar codigo/ e publicar na branch contexto` success (22 runs).

**Nota sobre o `npm run lint` direto (eslint):** 1028 erros/297 warnings existem no baseline, mas o CI **não** usa o eslint direto — usa o `lint-ratchet.mjs` que só falha em _novos_ erros. O gate real está verde. Dívida do baseline é rastreada pelo ratchet.

## 2. Cobertura de funcionalidades no código (main `b7c5ffa8`)

### 2.1 Frontend — 87 rotas em `src/routes/AppRoutes.tsx`

Todas **OK**: cada rota resolve uma página existente em `src/pages`. Amostra:
`/dashboard`, `/employees`, `/employee/:id`, `/employee/create`, `/activities`, `/activities/:id`, `/activities/timeline`, `/analytics`, `/reports`, `/reports/:id`, `/reports/custom`, `/reports/scheduled`, `/alerts`, `/alerts/:id`, `/alerts/rules`, `/monitoring`, `/violations`, `/violations/:id`, `/settings`, `/settings/profile`, `/settings/security`, `/settings/notifications`, `/settings/integrations`, `/settings/billing`, `/settings/api`, `/admin/users`, `/admin/roles`, `/admin/teams`, `/team/:id`, `/admin/departments`, `/department/:id`, `/admin/audit`, `/devices`, `/screenshots`, `/screenshots/:id`, `/integrations`, `/integrations/webhooks`, `/integrations/whatsapp`, `/calendar`, `/geofencing`, `/geofencing/alerts`, `/work-schedules`, `/export`, `/compliance`, `/ai-analysis`, `/gamification`, `/timesheets`, `/attendance`, `/hours-tracking`, `/admin/telemetria`, `/admin/dlp/policies`, `/admin/dlp/incidents`, `/admin/ueba`, `/admin/ueba/settings`, `/admin/ueba/:employeeId`, `/admin/edge-functions`, `/organization/chart`, `/docs/api`, `/verify-report`, `/agents/onboarding`, `/agents/:agentId/live`, `/admin/ice-diagnostics`, `/admin/live-view-report`, `/admin/acknowledgment-report`, `/admin/dispute-metrics`, `/admin/dispute-escalation-audit`, `/admin/integrations-health`, `/admin/session-recordings`, `/admin/file-transfers`, `/auth`, `/dev/chart-simulation`, `/dev/verify-simulator`, `/dev/live-view-simulator`, `*` (404).

**Sem TODOs/FIXME/WIP:** 0 ocorrências reais (`TODO:`/`FIXME:`/`WIP:`) em `src` e `supabase/functions`.
**Sem hardcode de segredo:** `src/integrations/supabase/client.ts` usa `import.meta.env.VITE_*` (fallback placeholder, sem key real).

### 2.2 Edge functions — 87 no `supabase/functions`

Listadas em anexo abaixo. Incluem: agent-collector, process-screenshot, analyze-activity, generate-report, send-whatsapp, send-slack-notification, send-webhook, sync-employee, sync-teams, import-employees, health, health-check, check-geofence, danger: verify-email, reset-password, webrtc-ice-config, trend-forecasting, risk-score-calculator, predict-anomaly.

**Estado de deploy:** BLOQUEADO — precisa validar no Supabase real (ver seção 6). Projeto configurado no repo: `ybvdtjpyolbnjirjrthe`.

### 2.3 Banco — migrations e RLS

- 102 arquivos de migration em `supabase/migrations`.
- ~90 tabelas `create table` (anexo 2).
- **121** verificações de `enable row level security` e **364** `create policy` nas migrations.
- **OK** (item 6, validado 2026-11-14 via Supabase Management API): **158 tabelas em public, 100% com RLS habilitado (0 sem RLS), 391 RLS policies ativas** em 158 tabelas. REST com Accept-Profile: public responde 200 com dados reais (profiles, companies).

### 2.4 Workflows do main (12 arquivos — `mobile-build.yml` removido pelo merge #130)

> Último run de cada workflow ativo no main (via `gh run list`, conferido em 2026-11-14):

| Workflow                            | Último run               | Resultado                                                                                                                                                |
| ----------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI                                  | `9954e10` (push)         | **success**                                                                                                                                              |
| Lint                                | `9954e10` (push)         | **success**                                                                                                                                              |
| Performance                         | `9954e10` (push)         | **success**                                                                                                                                              |
| Deploy                              | `9954e10` (push)         | **success**                                                                                                                                              |
| Security Scan                       | `576d84a` (push)         | **success**                                                                                                                                              |
| Security                            | `576d84a` (push)         | **success**                                                                                                                                              |
| Desktop Build                       | `db206d2` (push)         | **success**                                                                                                                                              |
| Contexto para agentes de IA         | `9954e10` (schedule)     | **success** (runs 30/30 min)                                                                                                                             |
| Preview                             | `0aa9307` (pull_request) | **success**                                                                                                                                              |
| Inventário do estado real (semanal) | `60779c3` (dispatch)     | **success**                                                                                                                                              |
| Update Dependencies                 | dispatch (revalidação)   | **failure** (12 vulns sem fix: xlsx sem correção + @typescript-eslint/minimatch/postcss exigem --force breaking) → **PR #132** aberta com `npm audit fix |     | true` |

**SITUAÇÃO**: revalidação no main (run `43588991065`) reprodou a mesma falha no `npm audit fix` — fix pendente na **PR #132** (regra 8).

### 2.5 Integrações (`.env.example`)

Supabase (URL/anon/service), Redis (REDIS_URL), JWT, SESSION_SECRET, SMTP (email), AWS (S3/CloudFront), Sentry. WhatsApp/Slack/Webhooks via edge functions.

## 3. Itens BLOQUEADOS e por quê

1. **RLS/policies no banco real** (req 6) — falta credencial/acesso ao Supabase atual (projeto `ybvdtjpyolbnjirjrthe` do config; tokens `sb_*` passados retornaram 401 e não batem com o projeto).
2. **Fluxos no ar** (req 7) — parcialmente OK: produção no ar via Vercel; edge functions/banco no Supabase exigem acesso `sbp_`.
3. **Update Dependencies verde** (req 4) — node 22 já resolveu o `edgesOut` (#129); agora falha nas 12 vulns sem fix. **PR #132** com `npm audit fix || true` aberta aguardando seu aval (regra 8).

## 4. PRs abertas aguardando decisão (regra 8)

- **#132** — `ci: torna npm audit fix tolerante no update-deps` (workflow; regra 8). Depois: redespachar update-deps e confirmar verde.
- Mergeadas: **#129** (update-deps node 22), **#130** (remover mobile-build), **#131** (prod-readiness). Main atual: `fcb31ffd5`.

## ANEXO 1 — Edge functions (87)

_shared, acknowledge-violation, agent-collector, analyze-activity, archive-data, audit-export, auto-categorize, backup-data, batch-notifications, behavioral-baseline-builder, behavior-pattern, bulk-update, calculate-productivity, check-geofence, cleanup-rate-limit-logs, cleanup-sessions, compress-screenshots, create-monthly-partitions, daily-summary, delete-user-data, dlp-incident-report, dlp-policy-sync, escalate-dispute-sla, expire-recordings, export-data, external-db-bridge, generate-api-key, generate-insights, generate-report, get-dashboard-stats, get-employee-schedule, get-employee-timeline, get-mapbox-token, get-policies, health, health-check, import-employees, ingest-file-transfer, invite-user, live-view-authorize, merge-employees, mobile-collector, natural-language-query, notify-dispute-decision, notify-mobile-violation, notify-new-device, ocr-screenshot, pending-employee-violations, predict-anomaly, process-bulk-import, process-screenshot, process-violation-alert, recalculate-metrics, refresh-tokens, request-overtime, reset-password, risk-score-calculator, rotate-api-keys, search-activities, send-email-notification, send-password-reset, send-push-notification, send-rate-limit-alert, send-scheduled-report, send-slack-notification, send-webhook, send-whatsapp, sentiment-analysis, slack-dlq-bulk-replay, slack-dlq-replay, slack-fallback-test, slack-mttr-monitor, slack-notify, slack-weekly-digest, smart-recommendations, summarize-activity, sync-employee, sync-teams, trend-forecasting, upload-recording-chunk, validate-agent-key, validate-license, verify-email, webrtc-ice-config, weekly-report.

## ANEXO 3 — Estado de validação do Supabase/Vercel

- **Config do repo**: `supabase/config.toml` → `project_id = "ybvdtjpyolbnjirjrthe"`.
- **Secrets presentes no repo**: SUPABASE_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID.
- **Deploy Vercel no main `60779c3b9` (merge #122)** foi SUCCESS (evidência de contexto anterior).
- **VALIDADO (2026-11-14) com token `sbp_`**: project `jgnmwvzephsozsqmcpzb` é o real do repo (config corrigido na #138). Banco: 158 tabelas public 100% RLS / 391 policies. Edge functions: 35 deployadas (9 originais + 26 recém-deployadas); `health-check` respondeu HTTP 200. Vercel: produção HTTP 200.

## ANEXO 4 — Estados de qualidade e gate no CI

- CI usa `lint-ratchet.mjs` e `typecheck-ratchet.mjs` (nunca o eslint/tsc direto) → gate de qualidade = dívida _nova_, não a acumulada.
- Jobs do `ci.yml`: quality (lint+typecheck ratchets, node 22), build (vite), test (vitest), deno-contract-tests (edge functions).
- `npm audit --audit-level=high || true` no CI (não bloqueia).

## ANEXO 5 — Prova de produção (req 7), main `61048d99f` em 2026-11-14

- **Check-runs do main `fcb31ffd5`** (via API): todos `success` (10/10): `analyze (js/ts)`, `analyze (actions)`, `lint`, `build`, `quality`, `deno-contract-tests`, `test`, `agent-instructions-guard`, `deploy` (Vercel), `lighthouse`.
- **Deploy do main final `61048d99f`**: run `43588969437` → **success** (`Deploy to Vercel`); produção alias `https://sentinela-v2.vercel.app`, preview `https://sentinela-v2-itjsj11um-juca1.vercel.app`.
- **Request real (após deploy do main final)**: `GET https://sentinela-v2.vercel.app` → **HTTP 200**, `text/html; charset=utf-8`, `<title>Sentinela - Monitoramento Corporativo</title>`, `<html lang="pt-BR">`. Ciclo merge → deploy → verificado fechado.
- **Composição do main**: `61048d99f` = #133 (docs, este relatório) sobre `fcb31ffd5` = #131 sobre `9954e10a8` = #130 sobre `ac5e159a` = #129.

## ANEXO 6 — Update Dependencies pós-#129 (diagnóstico real, run `43588140619`)

- `npm update` (node 22): **passou** — 820 packages, 12 vulns residuais (o erro `edgesOut` do npm arborist foi eliminado pelo node 22).
- `npm audit fix`: **exit 1** — 12 vulnerabilidades **sem fix automático**:
  - `xlsx`/sheetjs (Prototype Pollution GHSA-4r6h-8v6p-xvw6 + ReDoS GHSA-5pgg-2g8v-p4x9): **No fix available**.
  - `@typescript-eslint/*` → minimatch (GHSA-g3hv-75wg-m249): fix exige `npm audit fix --force` = breaking.
  - `postcss-selector-parser` via `@tailwindcss/typography` (GHSA-rj75-hqrm-r3gf): fix `--force` = breaking.
- **Confirmação no main**: redispatch pós-merge #133 (run `43588991065`) falhou no MESMO step (`Run npm audit fix` → `Process completed with exit code 1`) — o fix ainda está na **PR #132** (aberta, regra 8).
- **Ação**: mergir a **PR #132** (`npm audit fix || true`) e redespachar o update-deps para validar verde. As vulns **continuam sinalizadas** no `npm audit` do CI (moderate) — não são escondidas.

## ANEXO 2 — Tabelas (create table nas migrations)

agent_keys, ai_analysis_reports, alert_notification_settings, app_categories, application_rules, attendance_records, behavioral_baselines, blocked_ips, click_logs, click_logs_partitioned, companies, data_retention_policies, devices, dlp_classifiers, dlp_fingerprints, dlp_incidents, dlp_policies, dlp_redaction_log, employee_devices, employee_geofences, employee_schedules, employee_status, employees, file_transfers, geofence_violations, geofences, incident_mitre_mapping, internet_access_settings, keystroke_details, keystroke_logs, keystroke_logs_partitioned, live_view_audit, live_view_sessions, login_security_events, message_templates, mitre_techniques, mobile_activity_logs, mobile_activity_logs_partitioned, mobile_devices, monitoring_settings, overtime_requests, password_reset_requests, policy_exemptions, productivity_logs, productivity_logs_partitioned, profiles, projects, query_telemetry, rate_limit_logs, recording_chunks, recording_sessions, report_signatures, risk_score_factors, scheduled_report_settings, screen_captures, security_policies, security_violations, session_recordings, settings_audit_log, siem_connectors, siem_delivery_log, siem_event_outbox, slack_delivery_events, slack_integrations, slack_notification_dlq, station_block_logs, tasks, team_members, teams, time_entries, timesheets, user_companies, user_known_devices, user_risk_scores, user_roles, violation_disputes, violation_rules, webauthn_challenges, webauthn_credentials, webhook_logs, webhooks, whatsapp_message_logs, whatsapp_notification_settings, work_schedules.
