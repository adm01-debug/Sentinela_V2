# Contexto do projeto para agentes de IA

GERADO AUTOMATICAMENTE por scripts/ai-context/gerar.mjs — não editar à mão; será sobrescrito.
Publicado em `docs/contexto/codigo/` na branch `contexto` (gerada, nunca abra PR dela) a cada push em `main` e a cada 30 minutos pelo workflow `contexto.yml`. Gere local com `node scripts/ai-context/gerar.mjs`. Commit-base: `40ca833946ffa4c2b2b46f064782f090a92ebff1` (2026-11-12T20:37:33-03:00).

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
- linguagens: TypeScript (1378), Markdown (179), SQL (106), JSON (41), YAML (37), JavaScript (21), Shell (21), HTML (4)
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
- deploy: docker, compose/swarm
- monorepo: n/d
- pastas_fonte: src

## Números
| item | qtd |
|---|---|
| arquivos_total | 1828 |
| arquivos_codigo | 1397 |
| linhas_codigo | 146714 |
| rotas | 54 |
| rotas_http_backend | 12 |
| vistas_por_id | 0 |
| itens_menu | 12 |
| modulos | 56 |
| componentes | 460 |
| hooks | 524 |
| edge_functions | 84 |
| tabelas | 139 |
| migrations | 102 |
| cron_jobs | 1 |
| testes | 69 |
| workflows | 14 |
| scripts | 30 |
| docs_md | 179 |

## Onde ficam as coisas
- telas: src/pages (54)
- componentes: src/components (355), src/pages (88), src/providers (8)
- hooks: src/hooks (477), src/stores (33), src/lib (5)
- servicos_logica: src/utils (64), src/lib (39), src/stores (34)
- testes: co-localizado (*.test) (44), co-localizado (__tests__) (19), outro (5)
- edge_functions: supabase/functions
- migrations: supabase/migrations
- scripts: scripts/ci (3), scripts/ai-context (2), scripts/inventario (2)
- docs: docs (98), (raiz) (16), .github (2)
- nomenclatura: {"componentes":"PascalCase (87%)","hooks":"use + PascalCase","servicos":"camelCase (99%)","edge_functions":"kebab-case (99%)","tabelas":"snake_case (88%)"}
- instruções para agentes no repo: AGENTS.md, CLAUDE.md

## Módulos (menu → domínio)
| módulo | itens de menu | telas/rotas | arquivos | hooks locais | edges | tabelas |
|---|---|---|---|---|---|---|
| components | 0 | 0 | 98 | 84 | 1 | 22 |
| components/admin | 0 | 0 | 8 | 5 | 6 | 7 |
| components/auth | 0 | 0 | 5 | 9 | 1 | 3 |
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
| hooks | 0 | 0 | 479 | 494 | 19 | 84 |
| lib | 0 | 0 | 18 | 0 | 0 | 3 |
| lib/utils | 0 | 0 | 13 | 0 | 0 | 0 |
| pages | 4 | 37 | 66 | 117 | 4 | 54 |
| pages/admin | 0 | 14 | 16 | 24 | 8 | 28 |
| pages/dashboard | 0 | 0 | 5 | 2 | 0 | 0 |
| pages/dev | 0 | 3 | 3 | 14 | 0 | 1 |
| providers | 0 | 0 | 9 | 6 | 0 | 2 |
| services | 0 | 0 | 8 | 20 | 2 | 10 |
| stores | 0 | 0 | 34 | 3 | 0 | 2 |
| types | 0 | 0 | 57 | 0 | 0 | 0 |
| utils | 0 | 0 | 63 | 12 | 0 | 11 |

## Rotas (url → arquivo)
- `/*` [tela] → src/pages/NotFoundPage.tsx
- `/activities/:id` [tela] → src/pages/ActivityDetailPage.tsx
- `/activities/timeline` [tela] → src/pages/ActivityTimelinePage.tsx
- `/admin/acknowledgment-report` [tela] → src/pages/admin/AcknowledgmentReportPage.tsx (protegida)
- `/admin/dispute-escalation-audit` [tela] → src/pages/admin/DisputeEscalationAuditPage.tsx (protegida)
- `/admin/dispute-metrics` [tela] → src/pages/admin/DisputeMetricsPage.tsx (protegida)
- `/admin/dlp/incidents` [tela] → src/pages/admin/DLPIncidentsPage.tsx
- `/admin/dlp/policies` [tela] → src/pages/admin/DLPPoliciesPage.tsx
- `/admin/edge-functions` [tela] → src/pages/admin/EdgeFunctionDashboard.tsx
- `/admin/file-transfers` [tela] → src/pages/admin/FileTransfersPage.tsx (protegida)
- `/admin/ice-diagnostics` [tela] → src/pages/admin/IceDiagnosticsPage.tsx (protegida)
- `/admin/integrations-health` [tela] → src/pages/admin/IntegrationsHealthPage.tsx (protegida)
- `/admin/live-view-report` [tela] → src/pages/admin/LiveViewReportPage.tsx (protegida)
- `/admin/session-recordings` [tela] → src/pages/admin/SessionRecordingsPage.tsx (protegida)
- `/admin/telemetria` [tela] → src/pages/AdminTelemetriaPage.tsx (protegida)
- `/admin/ueba` [tela] → src/pages/admin/ueba/UEBADashboardPage.tsx
- `/admin/ueba/:employeeId` [tela] → src/pages/admin/ueba/EmployeeRiskProfilePage.tsx
- `/admin/ueba/settings` [tela] → src/pages/admin/ueba/UEBASettingsPage.tsx
- `/agents/:agentId/live` [tela] → src/pages/LiveViewPage.tsx (protegida)
- `/agents/onboarding` [tela] → src/pages/AgentOnboardingPage.tsx (protegida)
- `/ai-analysis` [tela] → src/pages/AIAnalysisPage.tsx
- `/alerts/:id` [tela] → src/pages/AlertDetailPage.tsx
- `/alerts/rules` [tela] → src/pages/AlertRulesPage.tsx
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
- `/reports/scheduled` [tela] → src/pages/ScheduledReportsPage.tsx
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
- `acknowledge-violation` — tabelas: agent_keys, security_violations, settings_audit_log; chamada por 0 arquivo(s) do front
- `agent-collector` — tabelas: agent_keys, click_logs, employees, keystroke_logs, productivity_logs, screen_captures; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `analyze-activity` — tabelas: click_logs, keystroke_logs, productivity_logs; chamada por 3 arquivo(s) do front
- `archive-data` — tabelas: click_logs, keystroke_logs, productivity_logs; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `audit-export` — tabelas: login_security_events, settings_audit_log; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auto-categorize` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `backup-data` — tabelas: backups; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `batch-notifications` — tabelas: webhooks; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `behavior-pattern` — tabelas: activities; chamada por 1 arquivo(s) do front
- `behavioral-baseline-builder` — tabelas: behavioral_baselines, click_logs, dlp_incidents, employees, keystroke_logs; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `bulk-update` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `calculate-productivity` — tabelas: keystroke_logs, productivity_logs; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `check-geofence` — tabelas: employee_locations, geofence_events, geofence_states, geofences; chamada por 1 arquivo(s) do front
- `cleanup-rate-limit-logs` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `cleanup-sessions` — tabelas: session_recordings; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `compress-screenshots` — tabelas: screen_captures; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `create-monthly-partitions` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `daily-summary` — tabelas: click_logs, employees, keystroke_logs, security_violations; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `delete-user-data` — tabelas: click_logs, employee_badges, employee_devices, employee_geofences, employee_points, employee_schedules, employees, geofence_violations, internet_access_settings, keystroke_details, keystroke_logs, mobile_activity_logs, screen_captures, security_violations, session_recordings; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `dlp-incident-report` — tabelas: agent_keys, dlp_incidents, dlp_redaction_log; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `dlp-policy-sync` — tabelas: agent_keys, dlp_classifiers, dlp_policies; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `escalate-dispute-sla` — tabelas: edge_function_logs, mobile_devices, user_roles, violation_disputes; chamada por 1 arquivo(s) do front
- `expire-recordings` — tabelas: data_retention_policies, file_transfers, recording_chunks, recording_sessions; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `export-data` — tabelas: -; chamada por 1 arquivo(s) do front
- `external-db-bridge` — tabelas: query_telemetry; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-api-key` — tabelas: agent_keys; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-insights` — tabelas: activity_logs, employees, profiles, violations; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-report` — tabelas: ai_analysis_reports, keystroke_logs, productivity_logs, security_violations; chamada por 3 arquivo(s) do front
- `get-dashboard-stats` — tabelas: employees, security_violations; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `get-employee-schedule` — tabelas: employee_schedules; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `get-employee-timeline` — tabelas: click_logs, keystroke_logs, screen_captures, security_violations; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `get-mapbox-token` — tabelas: -; chamada por 1 arquivo(s) do front
- `get-policies` — tabelas: policy_acknowledgments, security_policies; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `health` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `health-check` — tabelas: health_check, screenshots; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `import-employees` — tabelas: employees; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `ingest-file-transfer` — tabelas: agent_keys, dlp_incidents, dlp_policies, employees, file_transfers; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `invite-user` — tabelas: user_companies, user_roles; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `live-view-authorize` — tabelas: agent_keys, live_view_audit, live_view_sessions; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `merge-employees` — tabelas: click_logs, devices, employee_badges, employee_devices, employee_geofences, employee_schedules, employees, geofence_violations, keystroke_logs; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `mobile-collector` — tabelas: agent_keys, employees, mobile_activity_logs, mobile_devices; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `natural-language-query` — tabelas: activities, employees, violations; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notify-dispute-decision` — tabelas: mobile_devices, settings_audit_log, violation_disputes; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notify-mobile-violation` — tabelas: mobile_devices, security_violations, settings_audit_log; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notify-new-device` — tabelas: login_security_events; chamada por 1 arquivo(s) do front
- `ocr-screenshot` — tabelas: screen_captures, sensitive_keywords; chamada por 1 arquivo(s) do front
- `pending-employee-violations` — tabelas: agent_keys, security_violations; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `predict-anomaly` — tabelas: activities; chamada por 1 arquivo(s) do front
- `process-bulk-import` — tabelas: employees; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `process-screenshot` — tabelas: screen_captures; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `process-violation-alert` — tabelas: alert_notification_settings, security_violations, settings_audit_log, webhooks; chamada por 0 arquivo(s) do front
- `recalculate-metrics` — tabelas: click_logs, employees, keystroke_logs, security_violations; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `refresh-tokens` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `request-overtime` — tabelas: overtime_requests; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `reset-password` — tabelas: login_security_events; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `risk-score-calculator` — tabelas: behavioral_baselines, click_logs, dlp_incidents, employees, keystroke_logs, risk_score_factors, user_risk_scores; chamada por 1 arquivo(s) do front
- `rotate-api-keys` — tabelas: agent_keys; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `search-activities` — tabelas: click_logs, keystroke_logs; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `send-email-notification` — tabelas: -; chamada por 1 arquivo(s) do front
- `send-password-reset` — tabelas: -; chamada por 1 arquivo(s) do front
- `send-push-notification` — tabelas: -; chamada por 2 arquivo(s) do front
- `send-rate-limit-alert` — tabelas: blocked_ips, rate_limit_alerts; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `send-scheduled-report` — tabelas: productivity_metrics, report_logs, scheduled_reports, security_violations; chamada por 1 arquivo(s) do front
- `send-slack-notification` — tabelas: -; chamada por 1 arquivo(s) do front
- `send-webhook` — tabelas: webhook_logs, webhooks; chamada por 1 arquivo(s) do front
- `send-whatsapp` — tabelas: -; chamada por 2 arquivo(s) do front
- `sentiment-analysis` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `slack-dlq-bulk-replay` — tabelas: edge_function_logs, slack_integrations, slack_notification_dlq; chamada por 1 arquivo(s) do front
- `slack-dlq-replay` — tabelas: edge_function_logs, slack_integrations, slack_notification_dlq; chamada por 1 arquivo(s) do front
- `slack-fallback-test` — tabelas: alert_notification_settings, edge_function_logs; chamada por 1 arquivo(s) do front
- `slack-mttr-monitor` — tabelas: edge_function_logs, slack_webhook_mttr; chamada por 1 arquivo(s) do front
- `slack-notify` — tabelas: alert_notification_settings, edge_function_logs, slack_delivery_events, slack_integrations, slack_notification_dlq; chamada por 1 arquivo(s) do front
- `slack-weekly-digest` — tabelas: edge_function_logs, security_violations, slack_integrations, slack_notification_dlq, slack_webhook_mttr, violation_disputes; chamada por 1 arquivo(s) do front
- `smart-recommendations` — tabelas: activities, employees, violations; chamada por 1 arquivo(s) do front
- `summarize-activity` — tabelas: activities, violations; chamada por 1 arquivo(s) do front
- `sync-employee` — tabelas: employees, sync_logs; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `sync-teams` — tabelas: employees, team_members, teams; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `trend-forecasting` — tabelas: activities, violations; chamada por 1 arquivo(s) do front
- `upload-recording-chunk` — tabelas: agent_keys, data_retention_policies, employees, recording_chunks, recording_sessions; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `validate-agent-key` — tabelas: agent_keys; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `validate-license` — tabelas: companies, employees; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `verify-email` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `webrtc-ice-config` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `weekly-report` — tabelas: ai_analysis_reports, employees, keystroke_logs, productivity_logs, security_violations; chamada por 0 arquivo(s) do front — **ÓRFÃ**

## Cron jobs (pg_cron / vercel)
- `cleanup-slack-dlq-daily` 0 3 * * * (20260723160921_fcd89e01-e870-403c-92ff-9f0d7cebf3a9.sql)

## Integrações externas
- SDKs: HTTP (axios), Sentry, Supabase, i18next, react-query, zod
- hosts mais citados: api.resend.com, fcm.googleapis.com, api.ipify.org, releases.sentinela.app, x.supabase.co, api.lovable.dev, api.mapbox.com, api.pwnedpasswords.com, api.sentinela.app, api.x.com, attack.mitre.org, cdn.gpteng.co, cdnjs.cloudflare.com, fonts.googleapis.com, fonts.gstatic.com
- webhooks recebidos: nenhum
- env de integração (só nomes): AWS_SECRET_ACCESS_KEY, JWT_SECRET, LOVABLE_API_KEY, MAPBOX_PUBLIC_TOKEN, MAPBOX_SECRET_TOKEN, REDIS_URL, RESEND_API_KEY, RESEND_FROM_EMAIL, S3_BUCKET, S3_REGION, SENTRY_DSN, SESSION_SECRET, SLACK_WEBHOOK_URL, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER, VITE_SENTRY_DSN, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID

## Permissões / papéis
- papéis no código: status (20), alert (13), admin (12), button (7), user (7), combobox (3), list (3), progressbar (3), dialog (2), presentation (2), region (2), Admin (1), agent (1), developer (1), editor (1), group (1), img (1), link (1), listitem (1), main (1), member (1), navigation (1), null (1), object (1), separator (1), sup (1), supervisor (1), tab (1), tablist (1), timer (1), viewer (1)
- enums de papel: app_role: admin|user; user_role_type: viewer|supervisor|manager|admin|super_admin
- guards: src/guards/index.tsx · rotas protegidas: 14 · públicas: /*, /activities/:id, /activities/timeline, /admin/dlp/incidents, /admin/dlp/policies, /admin/edge-functions, /admin/ueba, /admin/ueba/:employeeId, /admin/ueba/settings, /ai-analysis, /alerts/:id, /alerts/rules, /attendance, /calendar, /compliance, /dev/chart-simulation, /dev/live-view-simulator, /dev/verify-simulator, /devices, /docs/api, /export, /gamification, /hours-tracking, /integrations, /integrations/webhooks, /integrations/whatsapp, /internet-access, /monitoring, /organization/chart, /projects, /reports/:id, /reports/custom, /reports/scheduled, /screenshots/:id, /time-clock, /timesheets, /verify-report, /violations, /violations/:id, /work-schedules
- feature flags: FEATURE_FLAGS, FEATURE_KEYS, FEATURE_TO_FACTOR, FEATURE_X, advancedReports, darkMode, exportPDF, mobileApp, newDashboard, nova-tela, novo-inbox

## Alertas (baseline.json → alertas)
- rotas_sem_arquivo: 0
- componentes_ambiguos: 0
- menu_sem_destino: 8 — ex.: Configurações -> /settings, Configurações -> settings, Dashboard -> /
- edges_orfas: 55 — ex.: agent-collector, archive-data, audit-export
- edges_chamadas_sem_pasta: 2 — ex.: award-gamification-points, sync-whatsapp-templates
- tabelas_sem_rls: 0
- tabelas_usadas_sem_definicao: 26 — ex.: activities, app_config, backups
- tabelas_com_drift_migration_vs_types: 9 — ex.: badges, employee_badges, employee_points
- rpcs_sem_definicao: 0
- componentes_orfaos: 101 — ex.: src/components/ActivityFeed.tsx, src/components/ActivityHeatmap.tsx, src/components/ActivityStatsCards.tsx
- componentes_com_nome_duplicado: 48 — ex.: ActivityHeatmap, AnalyticsProvider, AppProviders
- scripts_orfaos: 1 — ex.: scripts/release.sh
- env_usadas_nao_declaradas: 8 — ex.: DEV, MODE, PROD
- ciclos_de_import: 4
- possiveis_segredos_no_codigo: 1 — ex.: scripts/ai-context/cenarios.mjs:102

## Grafo de código (graphify)
- não gerado neste run. uvx --from "graphifyy[sql]" graphify update .  (ou: bun run graph:update); saída em graphify-out/ — graph.json e graph.html NÃO são versionados (dezenas de MB); use `graphify query/path/explain` localmente

## Hotspots (arquivos mais alterados, 90 dias)
- package.json (32)
- package-lock.json (31)
- ESTADO_ATUAL.md (6)
- .github/workflows/ci.yml (4)
- AGENTS.md (4)
- .github/workflows/contexto.yml (3)
- src/pages/__tests__/Auth.test.tsx (3)
- src/pages/__tests__/Settings.test.tsx (3)
- .github/workflows/cd.yml (2)
- .github/workflows/deploy.yml (2)
- .github/workflows/inventario-estado-semanal.yml (2)
- .github/workflows/security.yml (2)
- docs/agentes/github-ci.md (2)
- eslint.config.js (2)
- scripts/check-bundle-size.sh (2)

## Workflows
- `cd.yml` — CD (push)
- `ci.yml` — CI (pull_request, push)
- `contexto.yml` — Contexto para agentes de IA (30 min) (push, schedule, workflow_dispatch; cron 7-59/30 * * * *)
- `deploy.yml` — Deploy (push, workflow_dispatch)
- `desktop-build.yml` — Desktop Build (push)
- `inventario-estado-semanal.yml` — Inventário do estado real (semanal) (schedule, workflow_dispatch; cron 31 10 * * 1)
- `lint.yml` — Lint (pull_request, push)
- `mobile-build.yml` — Mobile Build (push)
- `performance.yml` — Performance (push)
- `preview.yml` — Preview (pull_request)
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
- `.github/PULL_REQUEST_TEMPLATE.md` (13 linhas)
- `.github/pull_request_template.md` (13 linhas)
- `AGENTS.md` — AGENTS.md — Sentinela V2 (134 linhas)
- `AUDITORIA_ENTERPRISE_SENTINELA.md` — RELATÓRIO DE AUDITORIA ENTERPRISE - SENTINELA SECURITYWATCH V2 (85 linhas)
- `CHANGELOG.md` — Changelog (63 linhas)
- `CLAUDE.md` (2 linhas)
- `CODE_OF_CONDUCT.md` — Code of Conduct (30 linhas)
- `CONTRIBUTING.md` — Contributing to Sentinela (47 linhas)
- `DOCUMENTATION_API_CONTRACTS.md` — Documentação de Contratos de API - Edge Functions & Webhooks (115 linhas)
- `DOCUMENTATION_EDGE_FUNCTIONS.md` — Documentação Técnica: Edge Functions (51 linhas)
- `ESTADO_ATUAL.md` — ESTADO ATUAL DO SISTEMA — SENTINELA V2 (942 linhas)
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
- `docs/ARCHITECTURE.md` — Architecture (52 linhas)
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
- `docs/DEPLOYMENT.md` — Deployment Guide (69 linhas)
- `docs/DESIGN_SYSTEM.md` — Sentinela Design System (161 linhas)
- `docs/DESKTOP_AGENT.md` — Sentinela Desktop Agent (13 linhas)
- `docs/DEVELOPMENT.md` — Sentinela Development Guide (225 linhas)
- `docs/DISASTER_RECOVERY.md` — Disaster Recovery Plan (130 linhas)
- `docs/DOCKER.md` — Docker Deployment Guide (28 linhas)
- `docs/EDGE_FUNCTIONS.md` — Supabase Edge Functions (16 linhas)
- `docs/ENCRYPTION.md` — Encryption Guide (150 linhas)
- `docs/ERROR_HANDLING.md` — Error Handling Guide (159 linhas)
- `docs/FAQ.md` — FAQ (43 linhas)
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
- `docs/INSTALLATION.md` — Installation Guide (45 linhas)
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
- `docs/TROUBLESHOOTING.md` — Troubleshooting Guide (51 linhas)
- `docs/TYPES.md` — TypeScript Types (16 linhas)
- `docs/USER_GUIDE.md` — User Guide (7 linhas)
- `docs/VPAT.md` — Voluntary Product Accessibility Template (VPAT) (17 linhas)
- `docs/WEBHOOKS.md` — Webhooks (50 linhas)
- `docs/api-reference.md` — API Reference (91 linhas)
- `docs/architecture.md` — Architecture (52 linhas)
- `docs/deployment.md` — Deployment Guide (69 linhas)
- `docs/faq.md` — FAQ (43 linhas)
- `docs/installation.md` — Installation Guide (45 linhas)
- `docs/troubleshooting.md` — Troubleshooting Guide (51 linhas)
- `docs/user-guide.md` — User Guide (67 linhas)
- subpastas de docs/: docs/guides (10), docs/tutorials (10), docs/adr (9), docs/examples (8), docs/agentes (7), docs/agent (1)
- CHANGELOG topo: [19.0.0] - 2026-01-13

## Últimos commits
- 2026-11-12 `40ca83394` fix(ci): normaliza separador de path do Windows no lint-ratchet (#114)
- 2026-11-12 `deec5b891` fix(desktop): valida desktop-agent por typecheck no CI em vez de electron-builder (#113)
- 2026-11-12 `69611c177` fix(ci): performance testa URL de producao correta (sentinela-v2.vercel.app) (#111)
- 2026-11-12 `dada0de0e` fix: security scan tolera audit baseline e snyk sem token (#110)
- 2026-11-12 `dc7d30c08` fix: porta hardening de seguranca da branch qa (CNPJ, UTF-8, ReDoS, JWT, rate limit) (#112)
- 2026-11-12 `2d707fd3c` build(deps-dev): bump @types/node from 26.6.3 to 26.6.6 (#109)
- 2026-11-12 `7e3b22a48` fix: remove src/components/Forms.tsx morto que sombreava o barrel forms/ (#108)
- 2026-11-12 `df537774d` build(deps): bump the test group across 1 directory with 6 updates (#85)
- 2026-11-12 `240a04d0d` build(deps): bump the react group across 1 directory with 35 updates (#107)
- 2026-11-12 `9de86acd5` build(deps): bump the i18n group across 1 directory with 2 updates (#83)
- 2026-11-12 `7e68d8aa1` build(deps): bump @supabase/supabase-js from 2.109.0 to 2.117.2 (#78)
- 2026-11-12 `4d5f94748` build(deps): bump @sentry/react from 10.74.0 to 11.2.0 (#77)
- 2026-11-12 `d64e52b76` build(deps): bump react-hook-form from 7.88.0 to 7.89.0 (#79)
- 2026-11-12 `5633fb5cb` ci(contexto): usa ubuntu-latest no lugar de ubuntu-24.04 para provisionar runner (#105)
- 2026-11-12 `7c7bc08ee` ci(deploy): usa vercel CLI atual via npx vercel@latest em vez do action v25 desatualizado (#104)

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
