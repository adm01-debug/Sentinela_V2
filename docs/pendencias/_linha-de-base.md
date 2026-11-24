# Linha de base - estado real de Sentinela_V2

Atualizado em 2026-11-24 (sessao autopilot - guardas de encoding e de contrato de
dados #273/#274, rate limit e retry_count das edges #275, guarda do rate limit
#276). Antes: 2026-11-22 (migrations automaticas no deploy #222/#227/#228,
MFAGuard #229, orfaos #223, mcp-query sem proxy admin #221), 2026-11-21
(contratos front<->banco #189-#193, varredura dos 332 selects, auditoria do
Deploy #194, OrgChart #195).
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
| supabase_migrations.schema_migrations                       | 122/122 alinhado ao repo | Zero divergencia nas duas direcoes (auditoria 2026-11-22)        |
| get_user_permissions / has_permission / has_role            | EXISTEM no banco         | EXECUTE anon REVOGADO (PR #175); authenticated/service_role OK   |
| entity_versions INSERT endurecido (PR #179)                 | APLICADO e validado      | anon 401; autenticado 201; changed_by alheio 403                 |
| check_permission                                            | NAO existe (0)           | Migration granular_roles nunca aplicada (ou drop); front nao usa |

## Edge functions

| Item                        | Estado                                      | Evidencia                                               |
| --------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| send-whatsapp               | DEPLOYADA v2 (roteador dual Meta/Evolution) | invoke POST: resposta do codigo novo                    |
| sync-whatsapp-templates     | DEPLOYADA (46 no total)                     | invoke antes 404 -> agora 401 sem auth                  |
| award-gamification-points   | CORRIGIDA (#275)                            | rate limit inoperante; E2E: 10x401 e 11o POST 429       |
| Contrato de colunas (views) | CORRIGIDO (7 edges, PR #188)                | 156 pares tabela/coluna cruzados com information_schema |
| generate-insights           | CORRIGIDA (401 em 100% das chamadas)        | getUser() sem token -> valida em /auth/v1/user; 200     |
| escalate-dispute-sla        | GATE REVERTIDO (cron usa anon key)          | Bloquear derrubava o SLA; volta com a migration         |

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

| Item                         | Estado                    | Evidencia                                                        |
| ---------------------------- | ------------------------- | ---------------------------------------------------------------- |
| Site sentinela-v2.vercel.app | NO AR, todas as rotas 200 | Rewrite do SPA no `vercel.json` (#246); antes so `/` abria       |
| Workflow Actions "Deploy"    | VERDE (auditoria)         | #194: passa a auditar o deployment Production em vez de publicar |
| Job `migrate` do Deploy      | VERDE, aplica DDL sozinho | #222 + #227 + #228: `supabase db push --remote --include-all`    |
| Deployment Protection Vercel | DESLIGADA                 | sso/password/fork protection off; o dominio servia login Vercel  |
| Variaveis `VITE_*` da Vercel | CRIADAS em Production     | `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (#246)     |
| Secret `SITE_URL` Supabase   | CRIADO                    | Sem ele o fallback hardcoded era a unica fonte                   |

### Producao estava quebrada e ninguem sabia (fechado em 261122, #246)

Tres falhas independentes deixavam o app inutilizavel no ar, todas invisiveis
para o CI porque o CI builda local com `.env`, nao em producao:

1. **Nenhuma rota alem da home abria.** Sem `vercel.json`, a Vercel tratava
   `/login`, `/reset-password` e `/dashboard` como arquivos estaticos e
   devolvia **404**. O link de recuperacao de senha do e-mail caia em 404.
   Corrigido com `rewrites` para `/index.html`.
2. **O bundle usava `placeholder.supabase.co`.** O projeto Vercel nao tinha
   nenhuma variavel `VITE_*`, entao `client.ts` caia no fallback e o app nao
   autenticava nem consultava. Corrigido criando as duas variaveis.
3. **O dominio principal servia a tela de login da Vercel.** O
   `sentinela-v2-juca1.vercel.app` estava com Deployment Protection ligada —
   e era ele o `site_url` do Auth e o fallback do `send-password-reset`.

Prova depois do fix: `/`, `/login`, `/reset-password`, `/dashboard`,
`/employees`, `/compliance`, `/admin/users` -> **200**; chunk `client` contem
`jgnmwvzephsozsqmcpzb` e **zero** `placeholder.supabase.co`; `POST /auth/v1/recover`
com `redirectTo` canonico -> **200**; deploy run `45060799459`, jobs
`migrate`/`deploy-functions`/`verify-production-deploy` **success**.

### Migrations automaticas no deploy (fechado em 261122)

O merge que toca banco **nao fica mais so no GitHub**. O job `migrate` do
`Deploy` roda em todo push para `main`, aplica o que falta e registra em
`supabase_migrations.schema_migrations`.

Secrets criados nesta rodada: `SUPABASE_ACCESS_TOKEN` (Management API) e
`SUPABASE_DB_PASSWORD`.

Duas correcoes depois do merge, ambas provadas em producao:

1. `db push` sem flag ia para o **stack local** (`127.0.0.1:54322`) e morria com
   `ECONNREFUSED`. Corrigido com `--remote` (#228). `--linked` tambem funciona
   mas emite deprecacao para a v4.
2. `setup-cli` com `version: latest` consulta a API do GitHub e o runner
   estourou rate limit ("Failed to resolve latest Supabase CLI release"). A
   versao agora e fixada no workflow (#230).

Prova: run `45027956442`, job `migrate: success`, log
`Remote database is up to date.` Repo e banco: 122 migrations de cada lado,
zero divergencia nas duas direcoes.

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
- Workflow Deploy: verde no run 45317165963 (commit fee6687be) - migrate,
  deploy-functions e verify-production-deploy todos success; rotacao do
  VERCEL_TOKEN nao e mais bloqueio observado.
- `deno check` nao roda no CI (`ci.yml` roda apenas `deno test`): auditoria de
  2026-11-24 nas 88 edge functions -> 33 com 49 erros de tipo, dos quais 2 eram
  bugs reais e silenciosos (corrigidos na #275). O rate limit agora tem guarda
  estatica (#276); o resto do catalogo e ruido (`catch unknown`, genericos do
  supabase-js, `new Date(null)` em coluna NOT NULL).
- Deploy das migrations/edge por PR futura conforme regra 8 (DDL/deploy).

## Auxiliares orfaos

- sql/create_missing_rpcs.sql: nao referenciado por codigo/script; funcionalidade
  (has_role) ja existe em producao. Pode ser descartado ou movido para docs.

## Orfaos com destino definido (2026-11-22)

Varredura de `src/components` + `src/pages` contra as rotas e imports de
`src/routes/AppRoutes.tsx`. Numero real: **132 componentes** sem import (o
inventario anterior de 226 estava inflado) e **1 pagina** sem rota.

### Paginas

| Arquivo                            | Situacao             | Destino                            |
| ---------------------------------- | -------------------- | ---------------------------------- |
| `pages/dashboard/DashboardTooltip` | Sem rota, sem import | Manter como auxiliar de tipografia |

As 3 paginas antes tratadas como orfas **nao sao**:

- `/admin/telemetria` -> `AdminTelemetriaPage` renderiza `TelemetryComponents`
  e `TelemetryTable`.
- `SettingsPage` e alias de `Settings`.

### Componentes com acesso a dados

| Componente                | Por que nao foi integrado                                      |
| ------------------------- | -------------------------------------------------------------- |
| `UserMenu`                | Duplica o menu do `Header`; dois menus na mesma tela           |
| `MFAVerify`               | **INTEGRADO** via `MFAGuard` no login (PR #229)                |
| `SessionPlayback`         | Duplica `SessionRecordingsPage`, que ja esta em rota           |
| `SimulateViolationButton` | Semeia violacao de demonstracao; nao deve existir em producao  |
| `LiveViewCard`            | **INTEGRADO** na secao de equipe de `MonitoringPage` (PR #223) |
| `KeystrokeActivityCard`   | **INTEGRADO** na secao de equipe de `MonitoringPage` (PR #223) |
| `ProductivityCard`        | **INTEGRADO** na secao de equipe de `MonitoringPage` (PR #223) |
| `ScreenCapturesCard`      | **INTEGRADO** na secao de equipe de `MonitoringPage` (PR #223) |

Os 4 cards foram colocados numa secao de equipe, e nao dentro do painel de um
funcionario, porque consultam os ultimos registros de todos os funcionarios
(`limit(10)` sem filtro de nome).

Restam 123 componentes de apresentacao sem import. Nenhum acessa dados; sao
blocos de UI (cards, badges, skeletons) que nao foram ligados a nenhuma tela.
Ficam no repositorio como biblioteca, sem impacto em producao.

## mcp-query (resolvido 2026-11-22)

| Item                         | Estado                                                           |
| ---------------------------- | ---------------------------------------------------------------- |
| Codigo-fonte versionado      | SIM - `supabase/functions/mcp-query/index.ts` (PR #221)          |
| Proxy `admin` (service_role) | **REMOVIDO do bundle em producao** (deploy 2026-11-22)           |
| Auth                         | Header `x-mcp-secret` = env `MCP_SECRET`; 401 em todos os demais |
| Bloqueio de SQL destrutivo   | `DROP                                                            | TRUNCATE | ALTER SYSTEM | RESET ALL` -> 400 |
| `exec_sql`                   | EXECUTE so para service_role                                     |

Prova do deploy: bundle de `functions/mcp-query/body` extraido em 22/11/2026
tem 0 ocorrencias de `body.admin` e `admin.path` (antes tinham 17 ocorrencias de
`admin`); POST sem header e com header errado retornam 401, inclusive no
payload `{"admin":{...}}`.

## Seguranca / 2FA (fechado em 261122)

`MFAVerify.tsx` e `useMFAStatus()` existiam e funcionavam, mas **nenhum codigo
checava o AAL da sessao**. Na pratica: quem cadastrava um fator continuava
entrando so com a senha. Agora `src/guards/MFAGuard.tsx` envolve o `MainLayout`
e pede o codigo quando `nextLevel === 'aal2'` e `currentLevel !== 'aal2'`.

- `auth.mfa_factors` = **0 linhas** em producao: ninguem tem fator, o guard
  libera todo mundo. Risco de lockout ao religar: zero.
- Falha **aberta** em erro da Auth API (documentado no codigo): prender todos
  por indisponibilidade e pior que o risco coberto, e o RLS continua valendo.
- Testes: `src/test/mfa-guard.test.tsx`, 4 casos (sem fator, AAL1 com fator,
  AAL2, erro da API).

Divida conhecida de seguranca (baixa prioridade, `anon` sem EXECUTE):
`log_activity`, `auto_log_activity` e `record_violation_action` sao
`SECURITY DEFINER` sem `SET search_path`.

## Proximos passos registrados

1. Homologar WhatsApp E2E: falta `EVOLUTION_INSTANCE_TOKEN` (GO do Zapp) ou
   credenciais Meta reais em `whatsapp_config`; sem isso o envio real nao pode
   ser provado.
2. ~~As 38 edge functions que existem no repo e nao existem em producao sao
   codigo morto~~ **OBSOLETO — ver "Functions x producao x gates (medido 23/11,
   22h45)" no fim deste documento**: as 88 pastas de `supabase/functions`
   respondem em producao (nenhuma 404). O que existe e um outro conjunto: 38
   funcoes publicadas que **nenhum arquivo deste repositorio referencia**.
   Decidir se remove ou se mantem como plano futuro.
3. Bancos de rota: manter ratchets dos CI zerados a cada merge.
4. PolicyGate — **RESOLVIDO E NO AR** (banco + codigo na main).

   Por que trancava (PR #223, revert 75596b2b5): a RLS de SELECT de
   `policy_acknowledgments` e `has_role(auth.uid(),'admin')` e a tabela **nao
   tinha `user_id`** — so `employee_name`, texto livre. Usuario comum
   consultava, recebia vazio, caia em "Acesso Bloqueado".

   Aplicado em producao nesta sessao (migration `20261122140000`):
   - coluna `user_id` + indice `(user_id, acknowledged_at desc)`;
   - backfill dos registros antigos por email/nome;
   - RPC `my_policy_acknowledgment_status()` `security definer`, `search_path`
     fixo, EXECUTE so para `authenticated` — **anon recebe 401** (verificado);
   - insert passa a exigir `user_id = auth.uid()` quando ha sessao.

   `PolicyGate.tsx` foi reescrito para consultar a RPC e e **fail-open**: erro,
   excecao, retorno vazio ou `uid` nulo liberam o acesso. Um gate de
   conformidade nunca pode virar lockout.

   **Mergeado e no ar**: #239 (`d5ef6cbbb`) + #240 (`1ff674904`), deploy
   45052923004 com os 3 jobs verdes. Homologado E2E na main final com JWT de
   usuario comum: RPC `false` -> INSERT `201` -> RPC `true`
   (`last_acknowledged_at: 2026-11-22T18:06:22`). Banco restaurado depois
   (0 aceites, 2 usuarios).

   Bug corrigido na #239 (commit 2be63c533): o `PolicyAcknowledgmentDialog` inseria
   o aceite **sem `user_id`**, mas a RPC filtra por ele. O funcionario aceitava,
   o registro ficava anonimo e o gate continuava bloqueando para sempre. Agora o
   insert grava `user_id: user.id`, e ha teste de regressao que falha sem o fix.

   Homologado E2E em producao com JWT real de usuario comum (usuario temporario
   sem role admin, criado e removido na mesma sessao): RPC `false` antes, INSERT
   `201`, INSERT com `user_id` alheio `403`, RPC `true` depois
   (`last_acknowledged_at: 2026-11-22T17:33:16`). Banco restaurado:
   0 aceites, 2 usuarios.

   Bug corrigido de passagem: a foto do aceite usava `getPublicUrl()` num bucket
   privado (`acknowledgment-photos`), gravando URL que nunca abria — agora
   `createSignedUrl` (#238, ja na main).

---

## Auditoria de hooks e rotas orfaos (23/11)

### Bug real corrigido — regras de alerta usavam a tabela errada

`AlertRulesPage`, `AlertRuleCreatePage` e `useAlertRules` operavam sobre
`application_rules`, que e o **catalogo de aplicativos** (`name`, `category`
productivity|communication|entertainment|development|other, `status`
allowed|blocked|monitored). A tela `/alerts/rules` gerenciava aplicativos em vez
de regras de alerta; o sistema real (`violation_rules`) nunca aparecia na UI.

Corrigido na #256 (`ac2d34c`): passa a usar `violation_rules` com o enum real
`violation_rule_type` (`blocked_site`, `blocked_keyword`, `blocked_app`,
`blocked_file_extension`, `work_hours`), `severity`, `is_active`,
`notify_admin`/`notify_employee`. Sem DDL — a tabela e as policies de admin ja
existiam.

O mesmo PR implementou o download real em `ReportList` (antes um
`toast.info('sera implementado em breve')`).

### Hooks `use*Page.ts` orfaos — escritos contra schema inexistente

15 hooks de pagina nao sao importados por nenhuma pagina. A causa nao e
esquecimento: foram escritos de um plano de melhorias que nunca existiu no banco,
entao **ligar em UI produz 400/PGRST204 do Postgres**.

| Hook                        | Divergencia                                                                                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useViolationRulesPage`     | enum proprio `app/url/keyword/time/geofence/idle/usb/print`; o enum real nao tem `geofence`/`idle`/`usb`/`print`                                                                       |
| `useMessageTemplatesPage`   | categorias `notification/alert/reminder/...`; `template_type` e consumido por `sync-whatsapp-templates` no vocabulario WhatsApp — sobrescrever quebraria a sync                        |
| `useMonitoringPoliciesPage` | inventa modelo "policy"; `monitoring_settings` e chave/valor (`setting_key UNIQUE` + `setting_value jsonb`, 4 linhas seed)                                                             |
| `useRateLimitDashboardPage` | `rate_limit_logs` tem policy `"Service role only" USING (false)` — admin nao le, dashboard mostraria zero para sempre. `rate_limit_settings` existe na migration mas nao em `types.ts` |

Decisao: **nao ligar** nenhum deles sem antes portar o hook para o schema real.
Varios exigem DDL (regra 8).

### Falsos orfaos confirmados

- `useDashboardPage`, `useReportsPage`, `useSecurityPage`, `useTeamsPage`,
  `useUserManagementPage`, `useDataExportPage`, `useEmployeeDetailPage`,
  `useInstallPage`, `useMobileMonitoringPage` — a pagina consome um hook de nome
  diferente, nao este arquivo.
- `admin/TelemetryComponents.tsx` e `admin/TelemetryTable.tsx` sao consumidos por
  `AdminTelemetriaPage`; nao sao paginas.
- `Settings.tsx` e o corpo real de `/settings` — `SettingsPage.tsx` apenas
  reexporta (`export { default } from '@/pages/Settings'`).

### Tabelas usadas pelo front e ausentes de `types.ts`

**Resolvido na PR #260**: `types.ts` foi regenerado a partir do schema real
(`GET /v1/projects/{ref}/types/typescript`), passando de 154 para 207 entradas
(tabelas + 9 views + 33 funcoes). O conjunto contado nesta secao era menor
porque a linha de base olhou apenas as tabelas citadas no front; o schema real
tem 176 tabelas base + 9 views.

13 tabelas: `activity_logs`, `app_config`, `departments`, `feature_flags`,
`internet_access_rules`, `push_subscriptions`, `rate_limit_alerts`,
`rate_limit_settings`, `scheduled_reports`, `subscriptions`, `user_sessions`,
`violation_comments`, `whatsapp_settings`.

Destas, so `activity_logs` e `departments` **nao** tem `CREATE TABLE` em nenhuma
migration do repo (as outras 11 existem na migration e faltam apenas no arquivo
de tipos gerado). O client tolera `.from()` sem cast; o impacto e perda de
type-safety, nao erro em runtime.

`activity_logs` e lida por `useActivityHistory` e `useRealtimeActivity`, ambos
sem consumidor de pagina — o codigo morto esconde a tabela faltante.
`departments` e usada de verdade (`useDepartments`, `OrgChartPage`,
`useProductivityComparison`) e **tem** policy de escrita criada na migration
`20261122021000_fix_departments_write_rls.sql`, que faz `ALTER TABLE` numa tabela
que nenhuma migration deste repo cria — ou seja, ela existe em producao mas o
DDL de origem esta fora do repo.

### Edge functions abertas ao publico (auditado 2026-11-23)

Auditoria das 12 funcoes com `verify_jwt = false`, com POST `{}` real contra
`/functions/v1/<fn>` enviando o `apikey` publico (que o gateway **aceita** no
header `Authorization`): 9 tem gate proprio e respondem 401; `health-check`
responde 200 (so `{status,timestamp,version,uptime}`, sem dado de negocio); e 3
nao tinham gate nenhum:

| Funcao                    | Resposta sem JWT      | Efeito                                  |
| ------------------------- | --------------------- | --------------------------------------- |
| `send-whatsapp`           | 400 validation        | enviava WhatsApp pelo numero da empresa |
| `generate-report`         | 400 "Informe type..." | gerava relatorio via service_role       |
| `process-violation-alert` | 400 validation        | disparava alerta de violacao            |

`verify_jwt = true` **nao** resolve: provado com `get-dashboard-stats`
(`verify_jwt` default) respondendo **200** ao mesmo apikey publico no header
`Authorization`.

**Corrigido e provado em producao (PRs #261 e #262)**: `_shared/auth.ts` ganhou
`requireUserOrServiceRole`, que so deixa passar a `service_role` key (chamada
server-to-server: `check-geofence`, `ocr-screenshot` e `risk-score-calculator`
chamando `process-violation-alert`) ou um JWT de usuario valido (front com
sessao). O resto recebe 401. Teste de contrato em `_shared/auth_test.ts`.

A primeira versao reconhecia a `service_role` so por igualdade de string com
`SUPABASE_SERVICE_ROLE_KEY`; em projeto com o novo sistema de API keys o runtime
recebe a secret key (`sb_secret_...`) e a Management API continua devolvendo o
JWT legacy, entao a chamada interna passou a receber 401 (regressao detectada
no pos-deploy da #261). A #262 manteve o fast path e, quando o token nao e de
usuario, prova a credencial na API admin do GoTrue (`auth.admin.listUsers` com o
proprio token), que so responde para service_role - cobre JWT legacy e secret
key. Custo: 1 request extra so no caminho service_role ou token invalido.

Medido em producao depois do deploy de `61b2323c6` (run 45264419565, 3 jobs
success), com POST `{}` real:

| Chamador                                    | send-whatsapp | generate-report | process-violation-alert |
| ------------------------------------------- | ------------- | --------------- | ----------------------- |
| anonimo (chave publicavel)                  | 401           | 401             | 401                     |
| service_role legacy (Authorization+apikey)  | 400           | 400             | 400                     |
| JWT de usuario real (temp, depois removido) | 400           | 400             | 400                     |

`apikey` sozinho, sem `Authorization`, devolve 401: `functions.invoke` do
supabase-js sempre envia os dois headers, e os 3 chamadores internos usam
`functions.invoke`.

### Edge functions

87 pastas com `index.ts`, todas publicadas pelo deploy (`supabase functions
deploy --yes --use-api`); 48 tem bloco `[functions.X]` no `config.toml`. As 39
sem bloco usam os defaults (`verify_jwt = true`), que e o desejado.

### Deploy automatico — falhas reais observadas

Run `45195328319` (commit `ac2d34c`):

- `migrate`: success.
- `deploy-functions`: falhou com `unexpected deploy status 500: Failed to check
user auth status` — erro transitorio da API da Supabase. Rerun do job passou.
- `verify-production-deploy`: falhou **mesmo com o deployment confirmado**. O log
  mostra `Deployment 8001597727 -> success (tentativa 1)` e logo em seguida
  `nao concluiu em ~8 min (ultimo estado: success)`. Causa: o `break` esta dentro
  de um `case` do `switch`, entao nao sai do `for` e o `exit 1` final executa
  sempre. Corrigido na **PR #255** (aguardando aval — regra 8).

---

## Functions x producao x gates (medido 23/11, 22h45)

Medicao direta, nao estimativa: `OPTIONS /functions/v1/<fn>` com a chave
publicavel no `apikey`, para as **88 pastas** de `supabase/functions`. O 404 com
`{"code":"NOT_FOUND"}` e a unica resposta que prova ausencia; 200/204 prova que a
funcao esta publicada.

| Medicao                                          | Resultado         |
| ------------------------------------------------ | ----------------- |
| Pastas de function no repo                       | 88                |
| Publicadas em producao                           | **88 (zero 404)** |
| Com gate de auth no codigo                       | 42                |
| **Sem gate nenhum no codigo**                    | **46**            |
| Publicadas mas sem nenhuma referencia neste repo | 38                |

Correcao de registro: a nota anterior ("38 funcoes no repo e nao em producao")
descrevia o estado **antes** do job `deploy-functions` do `deploy.yml`, que hoje
publica todas as pastas a cada push na `main`. Nao ha funcao do repo faltando em
producao.

As 38 publicadas e sem referencia no repo (nenhum arquivo de `src/`, nenhuma
outra edge, nenhuma migration, nenhum workflow): `archive-data`, `audit-export`,
`auto-categorize`, `behavioral-baseline-builder`, `bulk-update`,
`calculate-productivity`, `cleanup-rate-limit-logs`, `cleanup-sessions`,
`compress-screenshots`, `create-monthly-partitions`, `daily-summary`,
`delete-user-data`, `dlp-incident-report`, `dlp-policy-sync`,
`external-db-bridge`, `generate-api-key`, `generate-insights`,
`get-dashboard-stats`, `get-employee-schedule`, `get-employee-timeline`,
`get-policies`, `import-employees`, `invite-user`, `mcp-query`, `merge-employees`,
`natural-language-query`, `pending-employee-violations`, `process-bulk-import`,
`process-screenshot`, `recalculate-metrics`, `refresh-tokens`, `request-overtime`,
`rotate-api-keys`, `search-activities`, `sentiment-analysis`, `sync-teams`,
`validate-license`, `weekly-report`.

Cuidado ao concluir "codigo morto": **`cron.job` nao aparece neste repo**. Os
crons do SLA, do `expire-recordings` e dos dois de Slack foram criados pelo
painel e so apareceram aqui quando uma migration passou a ler o `command` do job
(`20261121201500`). Uma funcao sem referencia no repo pode perfeitamente estar
sendo chamada por um job invisivel, por cliente externo (agente desktop, app
mobile) ou por integracao — e foi exatamente isso que derrubou o cron do
escalonamento de SLA na #268. Portanto: **nao apagar nem gatear** essas funcoes
sem antes ler `cron.job` no banco.

### Ordem do deploy de producao

`deploy.yml` tem 3 jobs (`migrate` na linha 32, `deploy-functions` na 65,
`verify-production-deploy` na 88) **sem nenhum `needs:`** — `migrate` e
`deploy-functions` rodam em paralelo. Ou seja: a funcao pode ser publicada antes
da migration que ela precisa; por isso o gate de cron da PR #270 e fail-open
quando `public.cron_secrets` ainda nao existe. Se a intencao e DDL sempre antes
das funcoes, o `deploy-functions` precisa de `needs: migrate` (mudanca de
workflow, regra 8).

### Gate de auth no codigo das 46 abertas

O gateway aceita a chave publicavel, entao `verify_jwt` nao protege nada: o gate
tem de estar no codigo. Das 46 sem gate, 12 sao chamadas pelo front
(`agent-collector`, `batch-notifications`, `export-data`, `health-check`,
`ingest-file-transfer`, `mobile-collector`, `notify-dispute-decision`,
`notify-mobile-violation`, `reset-password`, `send-email-notification`,
`validate-agent-key`, `verify-email`) — varias delas em fluxo **sem sessao**
(`reset-password`, `verify-email`, `validate-agent-key` e o proprio
`health-check`), onde gate por usuario quebraria a funcionalidade. As demais nao
tem chamador localizado no repo.
