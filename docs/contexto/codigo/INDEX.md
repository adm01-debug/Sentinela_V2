# Contexto do projeto para agentes de IA

GERADO AUTOMATICAMENTE por scripts/ai-context/gerar.mjs — não editar à mão; será sobrescrito.
Publicado em `docs/contexto/codigo/` na branch `contexto` (gerada, nunca abra PR dela) a cada push em `main` e a cada 30 minutos pelo workflow `contexto.yml`. Gere local com `node scripts/ai-context/gerar.mjs`. Commit-base: `335cb7d14048f45f86be2ec68d1cdc2fe0ff8481` (2026-11-25T15:06:48-03:00).

## Como usar (leia antes de planejar ou executar qualquer tarefa)
1. **Tela/rota/menu** → `rotas.json` (url/vista/menu → arquivo → hooks → tabelas → edges; `rotas_http_backend` para APIs) e `modulos.json` (módulo inteiro + dependências entre módulos).
2. **Hook/serviço/lógica** → `hooks.json`, `logica.json` (quem usa, o que toca, se tem teste).
3. **Edge function / serverless** → `edge-functions.json` (verify_jwt, tabelas, env, quem chama, órfãs).
4. **Banco** → `banco.json` (colunas, RLS, policies, índices, FKs, triggers, cron jobs, buckets, drift migration×types, uso no código) — visão do código; para o banco vivo use o MCP.
5. **Antes de criar arquivo** → `convencoes.json` (onde ficam as coisas, nomenclatura, alias), `componentes.json` (nomes duplicados, órfãos), `grafo.json` (hubs, ciclos de import) e `grafo-graphify.json` (grafo por AST: comunidades, símbolos mais chamados, comunidade de cada arquivo).
6. **CI/scripts/deploy/env/integrações/permissões/flags** → `ferramentas.json` e `scripts.json`.
7. **Antes de abrir PR** → `testes.json` (o que tem e não tem teste, onde os testes ficam), `baseline.json` (alertas, TODOs, hotspots, últimos commits).
Os JSONs são grandes: filtre com `grep`/`jq` pelo caminho/arquivo/tabela da sua tarefa; não carregue tudo.

## Stack
- linguagens: TypeScript (1378), Markdown (176), SQL (128), JSON (45), YAML (37), JavaScript (28), Shell (22), HTML (4)
- linguagem_principal: TypeScript
- framework: React
- backend_http: n/d
- bundler: Vite
- roteador: react-router
- banco: Supabase
- testes: vitest, playwright
- ui: tailwind, radix/shadcn
- estado: react-query, zustand
- gerenciador_pacotes: bun
- node: 20
- python: n/d
- deploy: vercel, docker, compose/swarm
- monorepo: n/d
- pastas_fonte: src

## Números
| item | qtd |
|---|---|
| arquivos_total | 1858 |
| arquivos_codigo | 1404 |
| linhas_codigo | 159225 |
| rotas | 59 |
| rotas_http_backend | 12 |
| vistas_por_id | 0 |
| itens_menu | 12 |
| modulos | 58 |
| componentes | 470 |
| hooks | 527 |
| edge_functions | 50 |
| tabelas | 180 |
| migrations | 124 |
| cron_jobs | 5 |
| testes | 89 |
| workflows | 14 |
| scripts | 35 |
| docs_md | 176 |

## Onde ficam as coisas
- telas: src/pages (59)
- componentes: src/components (359), src/pages (93), src/providers (8)
- hooks: src/hooks (480), src/stores (33), src/lib (5)
- servicos_logica: src/utils (65), src/lib (39), src/stores (34)
- testes: co-localizado (*.test) (57), co-localizado (__tests__) (22), outro (9)
- edge_functions: supabase/functions
- migrations: supabase/migrations
- scripts: scripts/ci (7), scripts/ai-context (2), scripts/inventario (2)
- docs: docs (94), (raiz) (16), .github (1)
- nomenclatura: {"componentes":"PascalCase (87%)","hooks":"use + PascalCase","servicos":"camelCase (99%)","edge_functions":"kebab-case (100%)","tabelas":"snake_case (89%)"}
- instruções para agentes no repo: AGENTS.md, CLAUDE.md

## Módulos (menu → domínio)
| módulo | itens de menu | telas/rotas | arquivos | hooks locais | edges | tabelas |
|---|---|---|---|---|---|---|
| components | 0 | 0 | 101 | 88 | 5 | 20 |
| components/admin | 0 | 0 | 8 | 5 | 6 | 7 |
| components/auth | 0 | 0 | 5 | 9 | 1 | 4 |
| components/charts | 0 | 0 | 13 | 2 | 0 | 0 |
| components/dashboard | 0 | 0 | 34 | 4 | 0 | 3 |
| components/data-display | 0 | 0 | 10 | 0 | 0 | 0 |
| components/employees | 0 | 0 | 7 | 23 | 0 | 6 |
| components/layout | 0 | 0 | 6 | 1 | 0 | 1 |
| components/productivity | 0 | 0 | 6 | 10 | 0 | 4 |
| components/security | 0 | 0 | 31 | 26 | 1 | 11 |
| components/skeletons | 0 | 0 | 11 | 15 | 0 | 5 |
| components/ui | 0 | 0 | 127 | 11 | 0 | 0 |
| constants | 0 | 0 | 7 | 0 | 0 | 0 |
| hooks | 0 | 0 | 482 | 502 | 21 | 88 |
| lib | 0 | 0 | 18 | 0 | 0 | 3 |
| lib/utils | 0 | 0 | 13 | 0 | 0 | 0 |
| pages | 4 | 38 | 68 | 168 | 15 | 71 |
| pages/admin | 0 | 18 | 20 | 35 | 8 | 32 |
| pages/dev | 0 | 3 | 3 | 14 | 0 | 1 |
| providers | 0 | 0 | 9 | 6 | 0 | 2 |
| services | 0 | 0 | 8 | 20 | 2 | 10 |
| stores | 0 | 0 | 34 | 3 | 0 | 2 |
| types | 0 | 0 | 57 | 0 | 0 | 0 |
| utils | 0 | 0 | 64 | 12 | 0 | 12 |

## Rotas (url → arquivo)
- `/*` [tela] → src/pages/NotFoundPage.tsx
- `/activities/:id` [tela] → src/pages/ActivityDetailPage.tsx
- `/activities/timeline` [tela] → src/pages/ActivityTimelinePage.tsx
- `/admin/acknowledgment-report` [tela] → src/pages/admin/AcknowledgmentReportPage.tsx (protegida)
- `/admin/dispute-escalation-audit` [tela] → src/pages/admin/DisputeEscalationAuditPage.tsx (protegida)
- `/admin/dispute-metrics` [tela] → src/pages/admin/DisputeMetricsPage.tsx (protegida)
- `/admin/dlp/incidents` [tela] → src/pages/admin/DLPIncidentsPage.tsx (protegida)
- `/admin/dlp/keywords` [tela] → src/pages/admin/SensitiveKeywordsPage.tsx (protegida)
- `/admin/dlp/policies` [tela] → src/pages/admin/DLPPoliciesPage.tsx (protegida)
- `/admin/edge-functions` [tela] → src/pages/admin/EdgeFunctionDashboard.tsx (protegida)
- `/admin/file-transfers` [tela] → src/pages/admin/FileTransfersPage.tsx (protegida)
- `/admin/ice-diagnostics` [tela] → src/pages/admin/IceDiagnosticsPage.tsx (protegida)
- `/admin/integrations-health` [tela] → src/pages/admin/IntegrationsHealthPage.tsx (protegida)
- `/admin/live-view-report` [tela] → src/pages/admin/LiveViewReportPage.tsx (protegida)
- `/admin/message-templates` [tela] → src/pages/admin/MessageTemplatesPage.tsx (protegida)
- `/admin/mobile-monitoring` [tela] → src/pages/admin/MobileMonitoringPage.tsx (protegida)
- `/admin/rate-limits` [tela] → src/pages/admin/RateLimitDashboardPage.tsx (protegida)
- `/admin/session-recordings` [tela] → src/pages/admin/SessionRecordingsPage.tsx (protegida)
- `/admin/telemetria` [tela] → src/pages/AdminTelemetriaPage.tsx (protegida)
- `/admin/ueba` [tela] → src/pages/admin/ueba/UEBADashboardPage.tsx (protegida)
- `/admin/ueba/:employeeId` [tela] → src/pages/admin/ueba/EmployeeRiskProfilePage.tsx (protegida)
- `/admin/ueba/settings` [tela] → src/pages/admin/ueba/UEBASettingsPage.tsx (protegida)
- `/agents/:agentId/live` [tela] → src/pages/LiveViewPage.tsx (protegida)
- `/agents/onboarding` [tela] → src/pages/AgentOnboardingPage.tsx (protegida)
- `/ai-analysis` [tela] → src/pages/AIAnalysisPage.tsx
- `/alerts/:id` [tela] → src/pages/AlertDetailPage.tsx
- `/alerts/rules` [tela] → src/pages/AlertRulesPage.tsx
- `/alerts/rules/new` [tela] → src/pages/AlertRuleCreatePage.tsx
- `/attendance` [tela] → src/pages/AttendancePage.tsx
- `/auth` [tela] → src/pages/Auth.tsx (protegida)
- `/calendar` [tela] → src/pages/CalendarPage.tsx
- `/compliance` [tela] → src/pages/CompliancePage.tsx
- `/dev/chart-simulation` [tela] → src/pages/dev/ChartSimulationPage.tsx
- `/dev/live-view-simulator` [tela] → src/pages/dev/LiveViewSimulatorPage.tsx
- `/dev/verify-simulator` [tela] → src/pages/dev/VerifyReportSimulatorPage.tsx
- `/devices` [tela] → src/pages/DevicesPage.tsx
- `/docs/api` [tela] → src/pages/ApiDocsPage.tsx
- `/export` [tela] → src/pages/DataExportPage.tsx
- `/gamification` [tela] → src/pages/GamificationPage.tsx
- `/geofencing` [tela] → src/pages/GeofencingPage.tsx (protegida)
- `/geofencing/alerts` [tela] → src/pages/GeofenceViolationsPage.tsx (protegida)
- `/hours-tracking` [tela] → src/pages/HoursTrackingPage.tsx
- `/integrations` [tela] → src/pages/IntegrationsPage.tsx
- `/integrations/webhooks` [tela] → src/pages/WebhooksPage.tsx
- `/integrations/whatsapp` [tela] → src/pages/WhatsAppIntegrationPage.tsx
- `/internet-access` [tela] → src/pages/InternetAccessPage.tsx
- `/monitoring` [tela] → src/pages/MonitoringPage.tsx
- `/organization/chart` [tela] → src/pages/OrgChartPage.tsx
- `/projects` [tela] → src/pages/ProjectsPage.tsx
- `/reports/:id` [tela] → src/pages/ReportDetailPage.tsx
- `/reports/custom` [tela] → src/pages/CustomReportsPage.tsx
- `/reports/scheduled` [tela] → src/pages/ScheduledReportsPage.tsx (protegida)
- `/screenshots/:id` [tela] → src/pages/ScreenshotDetailPage.tsx
- `/time-clock` [tela] → src/pages/TimeClockPage.tsx
- `/timesheets` [tela] → src/pages/TimesheetsPage.tsx
- `/verify-report` [tela] → src/pages/VerifyReportPage.tsx
- `/violations` [tela] → src/pages/ViolationsPage.tsx
- `/violations/:id` [tela] → src/pages/ViolationDetailPage.tsx
- `/work-schedules` [tela] → src/pages/WorkSchedulesPage.tsx

## Rotas HTTP de backend
- `GET /{t}` → scripts/ai-context/cenarios.mjs
- `GET /a` → scripts/ai-context/cenarios.mjs
- `GET /a` → scripts/ai-context/cenarios.mjs
- `POST /b` → scripts/ai-context/cenarios.mjs
- `POST /b` → scripts/ai-context/cenarios.mjs
- `DELETE /c` → scripts/ai-context/cenarios.mjs
- `PUT /d` → scripts/ai-context/cenarios.mjs
- `GET /items` → scripts/ai-context/gerar.unit.mjs
- `GET /u` → scripts/ai-context/cenarios.mjs
- `GET /users` → scripts/ai-context/cenarios.mjs
- `POST /users/:id` → scripts/ai-context/cenarios.mjs
- `GET /x` → scripts/ai-context/cenarios.mjs

## Vistas por id (menu/ViewRouter → arquivo)
- (nenhum)

## Edge functions
- `acknowledge-violation` (verify_jwt=false) — tabelas: agent_keys, security_violations, settings_audit_log; chamada por 0 arquivo(s) do front
- `agent-collector` — tabelas: agent_keys, click_logs, employees, keystroke_logs, productivity_logs, screen_captures; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `analyze-activity` — tabelas: click_logs, keystroke_logs, productivity_logs; chamada por 2 arquivo(s) do front
- `award-gamification-points` — tabelas: employee_points, points_history, user_roles; chamada por 1 arquivo(s) do front
- `behavior-pattern` — tabelas: keystroke_logs; chamada por 1 arquivo(s) do front
- `check-geofence` — tabelas: geofence_violations, geofences; chamada por 1 arquivo(s) do front
- `dlp-incident-report` (verify_jwt=false) — tabelas: agent_keys, dlp_incidents, dlp_redaction_log; chamada por 0 arquivo(s) do front
- `dlp-policy-sync` (verify_jwt=false) — tabelas: agent_keys, dlp_classifiers, dlp_policies; chamada por 0 arquivo(s) do front
- `escalate-dispute-sla` — tabelas: edge_function_logs, mobile_devices, violation_disputes; chamada por 1 arquivo(s) do front
- `expire-recordings` — tabelas: data_retention_policies, file_transfers, recording_chunks, recording_sessions; chamada por 0 arquivo(s) do front, por SQL/cron
- `export-data` — tabelas: user_companies; chamada por 1 arquivo(s) do front
- `generate-insights` — tabelas: employees, keystroke_logs, security_violations; chamada por 1 arquivo(s) do front
- `generate-report` (verify_jwt=false) — tabelas: ai_analysis_reports, attendance_records, keystroke_logs, productivity_logs, reports, security_violations; chamada por 2 arquivo(s) do front
- `get-employee-schedule` — tabelas: employee_schedules; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `get-employee-timeline` — tabelas: click_logs, employees, keystroke_logs, screen_captures, security_violations; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `get-mapbox-token` — tabelas: -; chamada por 1 arquivo(s) do front
- `health-check` (verify_jwt=false) — tabelas: employees; chamada por 0 arquivo(s) do front
- `ingest-file-transfer` (verify_jwt=false) — tabelas: agent_keys, dlp_incidents, dlp_policies, employees, file_transfers; chamada por 0 arquivo(s) do front
- `live-view-authorize` (verify_jwt=false) — tabelas: agent_keys, live_view_audit, live_view_sessions; chamada por 0 arquivo(s) do front
- `mcp-query` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `mobile-collector` — tabelas: agent_keys, employees, mobile_activity_logs, mobile_devices; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `natural-language-query` — tabelas: employees, keystroke_logs, security_violations; chamada por 1 arquivo(s) do front
- `notify-dispute-decision` — tabelas: mobile_devices, settings_audit_log, violation_disputes; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notify-new-device` — tabelas: login_security_events; chamada por 1 arquivo(s) do front
- `ocr-screenshot` — tabelas: screen_captures, sensitive_keywords; chamada por 1 arquivo(s) do front
- `pending-employee-violations` (verify_jwt=false) — tabelas: agent_keys, security_violations; chamada por 0 arquivo(s) do front
- `predict-anomaly` — tabelas: keystroke_logs; chamada por 1 arquivo(s) do front
- `process-violation-alert` (verify_jwt=false) — tabelas: alert_notification_settings, security_violations, settings_audit_log, webhooks; chamada por 0 arquivo(s) do front
- `rate-limit-logs` — tabelas: rate_limit_logs, user_roles; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `risk-score-calculator` — tabelas: behavioral_baselines, click_logs, dlp_incidents, employees, keystroke_logs, risk_score_factors, user_risk_scores; chamada por 1 arquivo(s) do front
- `send-email-notification` — tabelas: -; chamada por 1 arquivo(s) do front
- `send-password-reset` — tabelas: -; chamada por 1 arquivo(s) do front
- `send-push-notification` — tabelas: -; chamada por 2 arquivo(s) do front
- `send-scheduled-report` — tabelas: productivity_metrics, report_logs, scheduled_reports, security_violations; chamada por 2 arquivo(s) do front
- `send-slack-notification` — tabelas: -; chamada por 1 arquivo(s) do front
- `send-webhook` — tabelas: webhook_logs, webhooks; chamada por 2 arquivo(s) do front
- `send-whatsapp` (verify_jwt=false) — tabelas: whatsapp_config; chamada por 2 arquivo(s) do front
- `slack-dlq-bulk-replay` — tabelas: edge_function_logs, slack_integrations, slack_notification_dlq; chamada por 1 arquivo(s) do front
- `slack-dlq-replay` — tabelas: edge_function_logs, slack_integrations, slack_notification_dlq; chamada por 1 arquivo(s) do front
- `slack-fallback-test` — tabelas: alert_notification_settings, edge_function_logs; chamada por 1 arquivo(s) do front
- `slack-mttr-monitor` — tabelas: edge_function_logs, slack_webhook_mttr; chamada por 1 arquivo(s) do front, por SQL/cron
- `slack-notify` — tabelas: alert_notification_settings, edge_function_logs, slack_delivery_events, slack_integrations, slack_notification_dlq; chamada por 1 arquivo(s) do front
- `slack-weekly-digest` — tabelas: edge_function_logs, security_violations, slack_integrations, slack_notification_dlq, slack_webhook_mttr, violation_disputes; chamada por 1 arquivo(s) do front, por SQL/cron
- `smart-recommendations` — tabelas: employees, keystroke_logs, security_violations; chamada por 1 arquivo(s) do front
- `summarize-activity` — tabelas: keystroke_logs, security_violations; chamada por 1 arquivo(s) do front
- `sync-whatsapp-templates` — tabelas: whatsapp_config, whatsapp_templates; chamada por 1 arquivo(s) do front
- `trend-forecasting` — tabelas: keystroke_logs, security_violations; chamada por 1 arquivo(s) do front
- `upload-recording-chunk` (verify_jwt=false) — tabelas: agent_keys, data_retention_policies, employees, recording_chunks, recording_sessions; chamada por 0 arquivo(s) do front
- `validate-agent-key` — tabelas: agent_keys; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `webrtc-ice-config` (verify_jwt=false) — tabelas: -; chamada por 0 arquivo(s) do front

## Cron jobs (pg_cron / vercel)
- `cleanup-slack-dlq-daily` 0 3 * * * (20260723160924_fcd89e01-e870-403c-92ff-9f0d7cebf3a9.sql)
- `escalate-dispute-sla-every-15min` */15 * * * * (20261121201500_schedule_cron_no_collision.sql)
- `expire-recordings-hourly` 15 * * * * → edge expire-recordings (20261121190000_fix_expire_recordings_cron_auth.sql)
- `slack-mttr-monitor-hourly` 15 * * * * → edge slack-mttr-monitor (20261121200500_fix_slack_cron_auth.sql)
- `slack-weekly-digest-monday` 0 9 * * 1 → edge slack-weekly-digest (20261121200500_fix_slack_cron_auth.sql)

## Integrações externas
- SDKs: HTTP (axios), Sentry, Supabase, i18next, react-query, zod
- hosts mais citados: api.resend.com, fcm.googleapis.com, api.ipify.org, graph.facebook.com, jgnmwvzephsozsqmcpzb.supabase.co, releases.sentinela.app, x.supabase.co, api.lovable.dev, api.mapbox.com, api.pwnedpasswords.com, api.sentinela.app, api.x.com, app.local, attack.mitre.org, cdn.gpteng.co
- webhooks recebidos: acknowledge-violation, dlp-incident-report, dlp-policy-sync, generate-report, health-check, ingest-file-transfer, live-view-authorize, pending-employee-violations, process-violation-alert, send-whatsapp, upload-recording-chunk, webrtc-ice-config
- env de integração (só nomes): AWS_SECRET_ACCESS_KEY, EVOLUTION_API_KEY, EVOLUTION_API_URL, EVOLUTION_INSTANCE_NAME, EVOLUTION_INSTANCE_TOKEN, HEALTH_STORAGE_BUCKET, JWT_SECRET, LOVABLE_API_KEY, MAPBOX_PUBLIC_TOKEN, MAPBOX_SECRET_TOKEN, MCP_SECRET, REDIS_URL, RESEND_API_KEY, RESEND_FROM_EMAIL, S3_BUCKET, S3_REGION, SENTRY_DSN, SESSION_SECRET, SLACK_WEBHOOK_URL, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER, VITE_SENTRY_DSN, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_PROVIDER

## Permissões / papéis
- papéis no código: status (20), admin (15), alert (13), user (8), button (7), combobox (3), presentation (3), progressbar (3), dialog (2), group (2), list (2), region (2), Admin (1), agent (1), developer (1), editor (1), img (1), link (1), main (1), navigation (1), null (1), object (1), separator (1), sup (1), supervisor (1), tab (1), tablist (1), timer (1), viewer (1)
- enums de papel: app_role: admin|user; user_role_type: viewer|supervisor|manager|admin|super_admin
- guards: src/guards/MFAGuard.tsx, src/guards/index.tsx · rotas protegidas: 25 · públicas: /*, /activities/:id, /activities/timeline, /ai-analysis, /alerts/:id, /alerts/rules, /alerts/rules/new, /attendance, /calendar, /compliance, /dev/chart-simulation, /dev/live-view-simulator, /dev/verify-simulator, /devices, /docs/api, /export, /gamification, /hours-tracking, /integrations, /integrations/webhooks, /integrations/whatsapp, /internet-access, /monitoring, /organization/chart, /projects, /reports/:id, /reports/custom, /screenshots/:id, /time-clock, /timesheets, /verify-report, /violations, /violations/:id, /work-schedules
- feature flags: FEATURE_FLAGS, FEATURE_KEYS, FEATURE_TO_FACTOR, FEATURE_X, advancedReports, darkMode, exportPDF, mobileApp, newDashboard, nova-tela, novo-inbox

## Alertas (baseline.json → alertas)
- rotas_sem_arquivo: 0
- componentes_ambiguos: 0
- menu_sem_destino: 8 — ex.: Configurações -> /settings, Configurações -> settings, Dashboard -> /
- edges_orfas: 8 — ex.: agent-collector, get-employee-schedule, get-employee-timeline
- edges_chamadas_sem_pasta: 1 — ex.: _gate
- tabelas_sem_rls: 0
- tabelas_usadas_sem_definicao: 0
- tabelas_com_drift_migration_vs_types: 11 — ex.: badges, click_logs, employee_points
- rpcs_sem_definicao: 0
- componentes_orfaos: 94 — ex.: src/components/ActivityFeed.tsx, src/components/ActivityHeatmap.tsx, src/components/ActivityStatsCards.tsx
- componentes_com_nome_duplicado: 48 — ex.: ActivityHeatmap, AnalyticsProvider, AppProviders
- scripts_orfaos: 1 — ex.: scripts/release.sh
- env_usadas_nao_declaradas: 8 — ex.: DEV, MODE, PROD
- ciclos_de_import: 4
- possiveis_segredos_no_codigo: 1 — ex.: scripts/ai-context/cenarios.mjs:102

## Grafo de código (graphify)
- não gerado neste run. uvx --from "graphifyy[sql]" graphify update .  (ou: bun run graph:update); saída em graphify-out/ — graph.json e graph.html NÃO são versionados (dezenas de MB); use `graphify query/path/explain` localmente

## Hotspots (arquivos mais alterados, 90 dias)
- package-lock.json (26)
- package.json (25)
- scripts/ci/eslint-baseline.json (22)
- docs/pendencias/_linha-de-base.md (21)
- scripts/ci/prettier-baseline.json (19)
- .github/workflows/deploy.yml (18)
- src/routes/AppRoutes.tsx (13)
- .github/workflows/ci.yml (8)
- scripts/ci/deno-check-baseline.json (8)
- src/components/AppSidebar.tsx (8)
- docs/prod-readiness.md (7)
- supabase/config.toml (7)
- src/index.css (5)
- src/test/gap-audit.test.ts (5)
- src/test/improvements-verification.test.ts (5)

## Workflows
- `ci.yml` — CI (pull_request, push)
- `contexto.yml` — Contexto para agentes de IA (30 min) (push, schedule, workflow_dispatch; cron 7-59/30 * * * *)
- `deploy.yml` — Deploy (push, workflow_dispatch)
- `desktop-build.yml` — Desktop Build (push)
- `estado-cron.yml` — Estado do agendador (schedule, workflow_dispatch; cron 17 11 * * 1)
- `inventario-estado-semanal.yml` — Inventário do estado real (semanal) (schedule, workflow_dispatch; cron 31 10 * * 1)
- `lint.yml` — Lint (pull_request, push)
- `performance.yml` — Performance (push)
- `preview.yml` — Preview (pull_request)
- `prune-edge-functions.yml` — Prune edge functions (workflow_dispatch)
- `release.yml` — Release (push)
- `security-scan.yml` — Security Scan (push, schedule; cron 0 0 * * *)
- `security.yml` — Security Scan (push, schedule; cron 0 0 * * 0)
- `update-deps.yml` — Update Dependencies (schedule, workflow_dispatch; cron 0 0 * * 0)

## Scripts npm
- `dev`: `vite`
- `build`: `bun scripts/generate-audit-pdf.js && vite build`
- `build:dev`: `vite build --mode development`
- `preview`: `vite preview`
- `lint`: `eslint . --ext .ts,.tsx`
- `lint:fix`: `eslint . --ext .ts,.tsx --fix`
- `format`: `prettier --write .`
- `format:check`: `prettier --check .`
- `type-check`: `tsc --noEmit`
- `prepare`: `husky`
- `analyze`: `vite-bundle-visualizer`
- `test`: `vitest run`
- `bundle-check`: `./scripts/check-bundle-size.sh`

## Documentos (raiz e docs/)
- `.github/pull_request_template.md` (17 linhas)
- `AGENTS.md` — AGENTS.md — Sentinela V2 (134 linhas)
- `AUDITORIA_ENTERPRISE_SENTINELA.md` — RELATÓRIO DE AUDITORIA ENTERPRISE - SENTINELA SECURITYWATCH V2 (85 linhas)
- `CHANGELOG.md` — Changelog (63 linhas)
- `CLAUDE.md` (2 linhas)
- `CODE_OF_CONDUCT.md` — Code of Conduct (30 linhas)
- `CONTRIBUTING.md` — Contributing to Sentinela (47 linhas)
- `DOCUMENTATION_API_CONTRACTS.md` — Documentação de Contratos de API - Edge Functions & Webhooks (115 linhas)
- `DOCUMENTATION_EDGE_FUNCTIONS.md` — Documentação Técnica: Edge Functions (51 linhas)
- `ESTADO_ATUAL.md` — ESTADO ATUAL DO SISTEMA — SENTINELA V2 (977 linhas)
- `MIGRATION_PLAN_FOR_CLAUDE_WEB.md` — PROMPT PARA CLAUDE WEB — ANÁLISE DE MIGRAÇÃO SENTINELA V2 (255 linhas)
- `README.md` — Sentinela (37 linhas)
- `ROADMAP.md` — SENTINELA — Roadmap Executivo 2026 (35 linhas)
- `SECURITY.md` — Security Policy (39 linhas)
- `VERSION.md` — Version (34 linhas)
- `VPAT.md` — Voluntary Product Accessibility Template (VPAT) (17 linhas)
- `audit_report.md` — RELATÓRIO DE AUDITORIA ENTERPRISE - SENTINELA SECURITYWATCH V2 (85 linhas)
- `docs/A11Y_AUDIT.md` — Accessibility Audit Report (24 linhas)
- `docs/ACCESSIBILITY.md` — Accessibility Guide (22 linhas)
- `docs/ADMIN_GUIDE.md` — Admin Guide (7 linhas)
- `docs/ADR.md` — 📐 Architecture Decision Records (ADRs) (58 linhas)
- `docs/ANALYTICS.md` — Analytics & Monitoring (13 linhas)
- `docs/API.md` — API Reference (43 linhas)
- `docs/API_KEYS.md` — API Keys (40 linhas)
- `docs/API_REFERENCE.md` — API Reference (6 linhas)
- `docs/API_VERSIONING.md` — API Versioning Guide (73 linhas)
- `docs/AUDITORIA_ENTERPRISE_SENTINELA.md` — RELATÓRIO DE AUDITORIA ENTERPRISE - SENTINELA SECURITYWATCH V2 (85 linhas)
- `docs/AUDITORIA_FUNCIONALIDADES.md` — 🔍 AUDITORIA EXAUSTIVA - Sentinela v20 (280 linhas)
- `docs/AUDIT_TRAIL.md` — Audit Trail Guide (161 linhas)
- `docs/AUTHENTICATION.md` — Authentication Guide (153 linhas)
- `docs/AUTHORIZATION.md` — Authorization Guide (176 linhas)
- `docs/BACKUP_RESTORE.md` — Backup & Restore Guide (136 linhas)
- `docs/BRANCHING_STRATEGY.md` — Branching Strategy (63 linhas)
- `docs/CACHING.md` — Caching Strategy (126 linhas)
- `docs/CODE_REVIEW.md` — Code Review Guide (73 linhas)
- `docs/CODE_REVIEW_GUIDELINES.md` — Code Review Guidelines — Sentinela (54 linhas)
- `docs/COMPLIANCE_GUIDE.md` — Compliance Guide (60 linhas)
- `docs/COMPONENTS.md` — Sentinela Component Library (199 linhas)
- `docs/CONFIGURATION.md` — Configuration (5 linhas)
- `docs/CONTEXTS.md` — React Contexts (16 linhas)
- `docs/CONTRIBUTING_DETAILED.md` — Contributing (7 linhas)
- `docs/DATABASE.md` — Database Schema (49 linhas)
- `docs/DATA_PRIVACY.md` — Data Privacy Guide (74 linhas)
- `docs/DEPENDENCY_UPDATES.md` — Dependency Update Status (53 linhas)
- `docs/DESIGN_SYSTEM.md` — Sentinela Design System (161 linhas)
- `docs/DESKTOP_AGENT.md` — Sentinela Desktop Agent (13 linhas)
- `docs/DEVELOPMENT.md` — Sentinela Development Guide (225 linhas)
- `docs/DISASTER_RECOVERY.md` — Disaster Recovery Plan (130 linhas)
- `docs/DOCKER.md` — Docker Deployment Guide (28 linhas)
- `docs/EDGE_FUNCTIONS.md` — Supabase Edge Functions (16 linhas)
- `docs/ENCRYPTION.md` — Encryption Guide (150 linhas)
- `docs/ERROR_HANDLING.md` — Error Handling Guide (159 linhas)
- `docs/FUNCIONALIDADES_COMPLETAS.md` — Sentinela - Levantamento Completo de Funcionalidades (305 linhas)
- `docs/GAP_ANALYSIS_ENTERPRISE.md` — Análise de Gaps — SENTINELA vs. Sistemas Enterprise de Classe Mundial (95 linhas)
- `docs/GETTING_STARTED.md` — Getting Started (38 linhas)
- `docs/GIT_FLOW.md` — Git Flow — Sentinela (49 linhas)
- `docs/GLOSSARY.md` — Glossary (4 linhas)
- `docs/HOOKS.md` — React Hooks Catalog (19 linhas)
- `docs/HOOKS_GUIDE.md` — Hooks Guide (68 linhas)
- `docs/HOTFIX_GUIDE.md` — Hotfix Guide (67 linhas)
- `docs/I18N.md` — Internationalization (i18n) (58 linhas)
- `docs/IMPLEMENTATION_COMPLETE_v20.md` — 🎉 SENTINELA v20 - IMPLEMENTAÇÃO COMPLETA (91 linhas)
- `docs/INCIDENT_RESPONSE.md` — Incident Response Guide (152 linhas)
- `docs/INTEGRATIONS.md` — Integrations Guide (14 linhas)
- `docs/KUBERNETES.md` — Kubernetes Deployment (12 linhas)
- `docs/LOGGING.md` — Logging Guide (172 linhas)
- `docs/MIGRATIONS.md` — Database Migrations (3 linhas)
- `docs/MOBILE_APP.md` — Sentinela Mobile App (13 linhas)
- `docs/MONITORING.md` — Monitoring Guide (11 linhas)
- `docs/MONITORING_GUIDE.md` — Monitoring Guide (53 linhas)
- `docs/ONBOARDING.md` — 🚀 Guia de Onboarding — Sentinela (70 linhas)
- `docs/PERFORMANCE.md` — Performance Guide (121 linhas)
- `docs/PERMISSIONS.md` — Permissions System (58 linhas)
- `docs/PLANO_IMPLEMENTACAO_COMPLETO.md` — 🔍 SENTINELA - ANÁLISE EXAUSTIVA E PLANO DE IMPLEMENTAÇÃO (438 linhas)
- `docs/PLANO_IMPLEMENTACAO_DEFINITIVO_v18.md` — 🎯 PLANO DE IMPLEMENTAÇÃO DEFINITIVO - SENTINELA v18 (573 linhas)
- `docs/PLANO_IMPLEMENTACAO_EXAUSTIVO.md` — 🔍 SENTINELA - ANÁLISE EXAUSTIVA E PLANO DE IMPLEMENTAÇÃO COMPLETO (1017 linhas)
- `docs/PLANO_IMPLEMENTACAO_v18.md` — 🎯 PLANO DE IMPLEMENTAÇÃO EXAUSTIVO - SENTINELA v18 (343 linhas)
- `docs/PLANO_MELHORIAS_PENDENTES_v20.md` — 🎯 SENTINELA v20 - PLANO EXAUSTIVO DE MELHORIAS PENDENTES (675 linhas)
- `docs/PLANO_MELHORIAS_v14.md` — 🎯 PLANO DE IMPLEMENTAÇÃO DE MELHORIAS - SENTINELA v14.0.0 (975 linhas)
- `docs/PROMPT_CONTINUACAO_v14.md` — 🚀 PROMPT DE CONTINUAÇÃO - SENTINELA v14.0.0 (196 linhas)
- `docs/QA-CLEANUP-REPORT.md` — 🏆 SENTINELA - PHD QA FINAL REPORT (124 linhas)
- `docs/QA-REPORT.md` — 🔬 SENTINELA v20 - QA ANALYSIS REPORT (185 linhas)
- `docs/QA_AUDIT_REPORT_v20.md` — 🔬 RELATÓRIO DE AUDITORIA QA - SENTINELA v20 (143 linhas)
- `docs/QUICK_START.md` — Quick Start Guide (63 linhas)
- `docs/RATE_LIMITING.md` — Rate Limiting Guide (77 linhas)
- `docs/README.md` — Sentinela Documentation (23 linhas)
- `docs/RELEASE_PROCESS.md` — Release Process Guide (69 linhas)
- `docs/ROADMAP_2026.md` — Roadmap 2026 — SENTINELA Enterprise (128 linhas)
- `docs/ROADMAP_Q1_2026.md` — Q1 2026 — Breakdown de User Stories (133 linhas)
- `docs/RUNBOOK.md` — Operations Runbook (140 linhas)
- `docs/SCALING.md` — Scaling Guide (134 linhas)
- `docs/SECURITY_AUDIT.md` — Security Audit Guide (52 linhas)
- `docs/SECURITY_PRACTICES.md` — Security Best Practices (6 linhas)
- `docs/SELF_HOSTING.md` — Self-Hosting Guide (29 linhas)
- `docs/SERVICES.md` — API Services (17 linhas)
- `docs/SLA.md` — Service Level Agreement (SLA) (98 linhas)
- `docs/SPONSORS.md` — Sponsors (8 linhas)
- `docs/STATE_MANAGEMENT.md` — State Management (49 linhas)
- `docs/STORES.md` — State Management (15 linhas)
- `docs/TYPES.md` — TypeScript Types (16 linhas)
- `docs/USER_GUIDE.md` — User Guide (7 linhas)
- `docs/VPAT.md` — Voluntary Product Accessibility Template (VPAT) (17 linhas)
- `docs/WEBHOOKS.md` — Webhooks (50 linhas)
- `docs/api-reference.md` — API Reference (91 linhas)
- `docs/architecture.md` — Architecture (61 linhas)
- `docs/deployment.md` — Deployment Guide (81 linhas)
- `docs/faq.md` — FAQ (52 linhas)
- `docs/installation.md` — Installation Guide (53 linhas)
- `docs/prod-readiness.md` (126 linhas)
- `docs/troubleshooting.md` — Troubleshooting Guide (60 linhas)
- `docs/user-guide.md` — User Guide (67 linhas)
- subpastas de docs/: docs/guides (10), docs/tutorials (10), docs/adr (9), docs/examples (8), docs/agentes (7), docs/pendencias (2), docs/agent (1)
- CHANGELOG topo: [19.0.0] - 2026-01-13

## Últimos commits
- 2026-11-25 `335cb7d14` feat: assina eventos e mostra entregas na tela de webhooks (#318)
- 2026-11-25 `1c198e947` fix(desktop-agent): tira os requires inline e o import morto (#316)
- 2026-11-25 `e8007929e` fix: useEmployeeSchedule devolve a escala vigente do funcionario (#315)
- 2026-11-25 `19a780dec` feat: traz o detalhe de cliques do funcionario para a jornada do dia (#314)
- 2026-11-25 `3ef51c691` feat: mostra a escala vigente na data escolhida na aba Atribuicoes (#313)
- 2026-11-25 `a8fb66069` fix: liga as operacoes reais da tela de escalas de trabalho (#311)
- 2026-11-25 `235f94b1c` feat: liga busca em dados reais na paleta de comandos (#310)
- 2026-11-25 `63e0317b6` ci: ciclo que le o agendador de producao (cron.job) e compara com as edges do repo (#307)
- 2026-11-25 `217616fef` fix: prune confirma pelo endpoint publico e pode ser reexecutado (#306)
- 2026-11-25 `c23267cd8` docs: alinha estado do repo apos remocao das 38 edges sem chamador (#308)
- 2026-11-25 `cc25e3612` feat: CI bloqueia edge function sem gate de credencial ou fora do config.toml (#304)
- 2026-11-25 `af9d004da` chore: remove as 38 edges legadas sem chamador do repo (#305)
- 2026-11-25 `0dada9e58` fix: exigir admin para notificar decisao de contestacao (#303)
- 2026-11-24 `2d3ed6cd1` fix: gate de credencial em 4 edges abertas a chave publicavel do app (#302)
- 2026-11-24 `716934523` fix: gate estrito nas 38 edges legadas, no lugar do gate de cron (#301)

## Arquivos deste diretório
- `docs/contexto/codigo/rotas.json`
- `docs/contexto/codigo/modulos.json`
- `docs/contexto/codigo/componentes.json`
- `docs/contexto/codigo/hooks.json`
- `docs/contexto/codigo/edge-functions.json`
- `docs/contexto/codigo/banco.json`
- `docs/contexto/codigo/ferramentas.json`
- `docs/contexto/codigo/scripts.json`
- `docs/contexto/codigo/testes.json`
- `docs/contexto/codigo/logica.json`
- `docs/contexto/codigo/grafo.json`
- `docs/contexto/codigo/grafo-arestas.json`
- `docs/contexto/codigo/convencoes.json`
- `docs/contexto/codigo/grafo-graphify.json`
- `docs/contexto/codigo/baseline.json`
- `docs/contexto/codigo/manifest.json` (commit, data, hashes, erros — único arquivo com data/hora)
