# Linha de base - estado real de Sentinela_V2

Atualizado em 2026-11-21 (sessao autopilot - contratos front<->banco #189-#193,
varredura dos 332 selects, auditoria do Deploy #194, OrgChart #195).
Todo item listado foi verificado com evidencia real (banco, RPC, edge function ou
merge). Estrategia: nenhum trabalho parcial de agente de IA e descartado; item
parcial e continuado ou registrado com dono.

## Banco de dados (projeto jgnmwvzephsozsqmcpzb)

| Item                                                        | Estado                   | Evidencia                                                        |
| ----------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------- |
| Migration #168 entity_versions (view latest_versions)       | APLICADA e validada      | View existe; anon sem leitura; SELECT autenticado OK             |
| whatsapp_templates + whatsapp_config (RLS ON, triggers)     | APLICADA e validada      | CRUD real (insert/update/delete) OK; REST 404 -> 200             |
| Migration #182 whatsapp_config provider Evolution (aditiva) | APLICADA e validada      | Colunas provider/evolution_api_url/evolution_instance_* existem  |
| RLS whatsapp_config (3 policies admin)                      | VIGENTE                  | pg_policies: INSERT/UPDATE/SELECT so has_role(admin)             |
| supabase_migrations.schema_migrations                       | 105/105 alinhado ao repo | Registradas 20261120133000, 20261121120000 e 20261121103305      |
| get_user_permissions / has_permission / has_role            | EXISTEM no banco         | EXECUTE anon REVOGADO (PR #175); authenticated/service_role OK   |
| entity_versions INSERT endurecido (PR #179)                 | APLICADO e validado      | anon 401; autenticado 201; changed_by alheio 403                 |
| check_permission                                            | NAO existe (0)           | Migration granular_roles nunca aplicada (ou drop); front nao usa |

## Edge functions

| Item                        | Estado                                             | Evidencia                                               |
| --------------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| send-whatsapp               | DEPLOYADA v2 (roteador dual Meta/Evolution)        | invoke POST: resposta do codigo novo                    |
| sync-whatsapp-templates     | DEPLOYADA (46 no total)                            | invoke antes 404 -> agora 401 sem auth                  |
| award-gamification-points   | DEPLOYADA (versao main, valida reason/description) | Restaurada de origin/main; sem alterar                  |
| Contrato de colunas (views) | CORRIGIDO (7 edges, PR #188)                       | 156 pares tabela/coluna cruzados com information_schema |
| generate-insights           | CORRIGIDA (401 em 100% das chamadas)               | getUser() sem token -> valida em /auth/v1/user; 200     |

## Contratos front <-> banco (varredura 2026-11-21)

Cruzamento dos **332 selects** do front (`src/**/*.{ts,tsx}`) e dos **writes**
contra `pg_class`/`pg_attribute`/`pg_attrdef` do projeto `jgnmwvzephsozsqmcpzb`.

| Correcao                                                        | Estado              | Evidencia                                                                   |
| --------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------- |
| export-data aceita contrato do front e exige auth (#189)        | MERGEADA            | CI verde; 401 sem token, 200 com token                                      |
| generate-report aceita os 3 contratos do front (#190)           | MERGEADA            | CI verde; status generating/completed/failed                                |
| get-employee-timeline e notify-new-device validam payload(#191) | MERGEADA            | 400 com payload invalido em vez de 500                                      |
| 4 selects do front alinhados ao schema (#192)                   | MERGEADA            | useDeviceStats/useGamificationPage/useRateLimitLogs/OrgChart                |
| 6 hooks de write alinhados ao schema (#193)                     | MERGEADA            | points_history/employee_points/agent_keys/message_templates/live_view_audit |
| OrgChartPage departments.company_id removido (#195)             | ABERTA (CI rodando) | `departments` nao tem company_id; pagina dava 400 no load                   |

Semantica real confirmada (nao existe no banco):

- `points_history`: `action_type`/`description` (nao `reason`).
- `employee_points`: `current_streak`/`longest_streak` (nao `best_streak`), sem
  `current_week_points`/`current_month_points`.
- `agent_keys`: `agent_key`/`key_name` (nao `key`/`name`).
- `message_templates`: `template_type`/`body`/`channel` (nao `type`).
- `profiles`: so `id, email, full_name, created_at, updated_at` — sem `name`,
  `role`, `is_active`, `avatar_url`. Papel vive em `user_roles`.
- `badges`: `points_required` (nao `points`).
- `live_view_audit`: `session_id, company_id, event, payload` (sem `decided_at`).
- `departments`: sem `company_id`.

Hooks com select em tabela inexistente (**mortos**, 0 imports a partir de paginas
— nada em producao afetado): `useAppConfig` (`app_config`), `useFeatureFlags`
(`feature_flags`), `useRateLimitDashboardPage`/`useRateLimitSettings`
(`rate_limit_settings`), `useSubscription` (`subscriptions`),
`useWhatsAppSettings` (`whatsapp_settings`).

## Edge functions

Hooks de front chamando edge inexistente: **nenhum** (34 invokes distintos, todos
com diretorio em `supabase/functions`).

## Deploy / producao

| Item                         | Estado                      | Evidencia                                                   |
| ---------------------------- | --------------------------- | ----------------------------------------------------------- |
| Site sentinela-v2.vercel.app | NO AR (200)                 | Deploy nativo Git<->Vercel entrega main a cada push         |
| Workflow Actions "Deploy"    | VERMELHO (16 runs seguidos) | "Could not retrieve Project Settings": runner sem `.vercel` |
| Correcao do Deploy (#194)    | ABERTA (regra 8)            | Passa a auditar o deployment Production em vez de publicar  |

## Edge functions e crons (auditoria 2026-11-21, PR #187)

| Item                                     | Estado                           | Evidencia                                                                                                                                                       |
| ---------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5 tabelas usadas por edges ativas        | CRIADAS (RLS ON, anon bloqueado) | sensitive_keywords/productivity_metrics/report_logs/rate_limit_alerts/sync_logs: REST 200 com service key, 42501 com anon                                       |
| health-check bucket                      | CORRIGIDO                        | usava bucket `screenshots` (inexistente) -> `violation-screenshots`; status `degraded` -> `healthy`                                                             |
| send-scheduled-report                    | CORRIGIDO                        | coluna inexistente `last_run` -> `last_run_at`; falta de token no `getUser()` + `verify_jwt` -> E2E `{"success":true}`                                          |
| process-violation-alert notified_admin   | CORRIGIDO                        | marcava `true` mesmo com envio de e-mail falhando; agora so com envio OK (violacao de teste ficou `false`)                                                      |
| Crons slack-mttr-monitor / weekly-digest | CORRIGIDO                        | auth ausente no cron -> 12x401/24h; recriados com `Authorization`; manual -> 200                                                                                |
| Colisao de slot nos crons                | CORRIGIDO                        | 3 jobs em todo `:15`; expire-recordings estourava timeout de 5000ms. Escalonado (5,35 / 20 / */15) com timeout 30s. Ciclo real `20:15`/`20:20` -> 200, zero 401 |

## Faltantes / bloqueios

- Rodar `whatsapp_config`: tabela existe e RLS vigente, mas sem credenciais reais
  (Meta ou Evolution GO) nao ha prova de envio ao vivo.
- Secrets ausentes no projeto: `RESEND_API_KEY`, `SLACK_WEBHOOK_URL`,
  `LOVABLE_API_KEY`, `MAPBOX_PUBLIC_TOKEN`, `FCM_SERVER_KEY`, `TURN_CREDENTIALS`.
  Sem eles os canais correspondentes falham (e-mail de alerta, Slack, OCR de
  screenshot, mapa, push mobile, TURN).
- Anon key legada (JWT) embutida inline nos comandos de `cron.job`: se a chave for
  rotacionada, todos os crons passam a levar 401.
- Codigo morto (hooks sem consumidor): useWhatsAppSettings, useRateLimitSettings,
  useSubscription, useAppConfig, useScheduledReports, useSessionManager,
  usePWAPushNotifications; tabelas `subscriptions`, `feature_flags`, `app_config`,
  `rate_limit_settings`, `whatsapp_settings` nao existem e nao sao usadas em runtime.
- Rotacionar VERCEL_TOKEN do GitHub Actions (owner do projeto sentinela-v2) para
  o workflow Deploy voltar a verde.
- Deploy das migrations/edge por PR futura conforme regra 8 (DDL/deploy).

## Auxiliares orfaos

- sql/create_missing_rpcs.sql: nao referenciado por codigo/script; funcionalidade
  (has_role) ja existe em producao. Pode ser descartado ou movido para docs.

## Orfaos com destino definido (2026-11-22)

Varredura de `src/components` + `src/pages` contra as rotas e imports de
`src/routes/AppRoutes.tsx`. Numero real: **132 componentes** sem import (o
inventario anterior de 226 estava inflado) e **1 pagina** sem rota.

### Paginas

| Arquivo                          | Situacao                                | Destino                             |
| -------------------------------- | --------------------------------------- | ----------------------------------- |
| `pages/dashboard/DashboardTooltip` | Sem rota, sem import                  | Manter como auxiliar de tipografia  |

As 3 paginas antes tratadas como orfas **nao sao**:

- `/admin/telemetria` -> `AdminTelemetriaPage` renderiza `TelemetryComponents`
  e `TelemetryTable`.
- `SettingsPage` e alias de `Settings`.

### Componentes com acesso a dados

| Componente                   | Por que nao foi integrado                                            |
| ---------------------------- | -------------------------------------------------------------------- |
| `UserMenu`                   | Duplica o menu do `Header`; dois menus na mesma tela                 |
| `MFAVerify`                  | Sub-fluxo de MFA que nenhum fluxo de login chama                    |
| `SessionPlayback`            | Duplica `SessionRecordingsPage`, que ja esta em rota                 |
| `SimulateViolationButton`    | Semeia violacao de demonstracao; nao deve existir em producao        |
| `LiveViewCard`               | **INTEGRADO** na secao de equipe de `MonitoringPage` (PR #223)       |
| `KeystrokeActivityCard`      | **INTEGRADO** na secao de equipe de `MonitoringPage` (PR #223)       |
| `ProductivityCard`           | **INTEGRADO** na secao de equipe de `MonitoringPage` (PR #223)       |
| `ScreenCapturesCard`         | **INTEGRADO** na secao de equipe de `MonitoringPage` (PR #223)       |

Os 4 cards foram colocados numa secao de equipe, e nao dentro do painel de um
funcionario, porque consultam os ultimos registros de todos os funcionarios
(`limit(10)` sem filtro de nome).

Restam 123 componentes de apresentacao sem import. Nenhum acessa dados; sao
blocos de UI (cards, badges, skeletons) que nao foram ligados a nenhuma tela.
Ficam no repositorio como biblioteca, sem impacto em producao.

## mcp-query (resolvido 2026-11-22)

| Item                              | Estado                                                        |
| --------------------------------- | ------------------------------------------------------------- |
| Codigo-fonte versionado           | SIM - `supabase/functions/mcp-query/index.ts` (PR #221)       |
| Proxy `admin` (service_role)      | **REMOVIDO do bundle em producao** (deploy 2026-11-22)        |
| Auth                              | Header `x-mcp-secret` = env `MCP_SECRET`; 401 em todos os demais |
| Bloqueio de SQL destrutivo        | `DROP|TRUNCATE|ALTER SYSTEM|RESET ALL` -> 400                 |
| `exec_sql`                        | EXECUTE so para service_role                                  |

Prova do deploy: bundle de `functions/mcp-query/body` extraido em 22/11/2026
tem 0 ocorrencias de `body.admin` e `admin.path` (antes tinham 17 ocorrencias de
`admin`); POST sem header e com header errado retornam 401, inclusive no
payload `{"admin":{...}}`.

## Proximos passos registrados

1. Homologar WhatsApp E2E: falta `EVOLUTION_INSTANCE_TOKEN` (GO do Zapp) ou
   credenciais Meta reais em `whatsapp_config`; sem isso o envio real nao pode
   ser provado.
2. Avaliar as PRs de regra 8 (DDL/deploy): #184 (revoga exec_sql anon), #186
   (auth do cron expire-recordings), #187 (5 tabelas de edges), #185 (5 tabelas
   do front + contrato generate-report) e #194 (auditoria do Deploy).
3. Bancos de rota: manter ratchets dos CI zerados a cada merge.
4. **#222 (migrations no deploy) aguarda o secret `SUPABASE_DB_PASSWORD`** no
   GitHub. O job `migrate` esta escrito e validado por `actionlint`, e hoje
   nasce verde porque repo e producao tem as mesmas 122 migrations (0 pendentes).
