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

| Correcao                                                      | Estado               | Evidencia                                                        |
| ------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------- |
| export-data aceita contrato do front e exige auth (#189)      | MERGEADA             | CI verde; 401 sem token, 200 com token                           |
| generate-report aceita os 3 contratos do front (#190)         | MERGEADA             | CI verde; status generating/completed/failed                     |
| get-employee-timeline e notify-new-device validam payload(#191)| MERGEADA            | 400 com payload invalido em vez de 500                           |
| 4 selects do front alinhados ao schema (#192)                 | MERGEADA             | useDeviceStats/useGamificationPage/useRateLimitLogs/OrgChart     |
| 6 hooks de write alinhados ao schema (#193)                   | MERGEADA             | points_history/employee_points/agent_keys/message_templates/live_view_audit |
| OrgChartPage departments.company_id removido (#195)           | ABERTA (CI rodando)  | `departments` nao tem company_id; pagina dava 400 no load        |

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

| Item                         | Estado                                      | Evidencia                                            |
| ---------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| Site sentinela-v2.vercel.app | NO AR (200)                                 | Deploy nativo Git<->Vercel entrega main a cada push  |
| Workflow Actions "Deploy"    | VERMELHO (16 runs seguidos)                 | "Could not retrieve Project Settings": runner sem `.vercel` |
| Correcao do Deploy (#194)    | ABERTA (regra 8)                            | Passa a auditar o deployment Production em vez de publicar |

## Faltantes / bloqueios

- Homologar WhatsApp E2E: whatsapp_config vazia em producao; precisa do token da
  instancia Evolution GO (vive no Vault do Zapp via get_instance_token) OU
  credenciais Meta reais (nao existem na organizacao).
- Rotacionar VERCEL_TOKEN do GitHub Actions (owner do projeto sentinela-v2) para
  o workflow Deploy voltar a verde.
- Deploy das migrations/edge por PR futura conforme regra 8 (DDL/deploy).

## Auxiliares orfaos

- sql/create_missing_rpcs.sql: nao referenciado por codigo/script; funcionalidade
  (has_role) ja existe em producao. Pode ser descartado ou movido para docs.

## Proximos passos registrados

1. Homologar WhatsApp E2E: falta `EVOLUTION_INSTANCE_TOKEN` (GO do Zapp) ou
   credenciais Meta reais em `whatsapp_config`; sem isso o envio real nao pode
   ser provado.
2. Avaliar as PRs de regra 8 (DDL/deploy): #184 (revoga exec_sql anon), #186
   (auth do cron expire-recordings), #187 (5 tabelas de edges), #185 (5 tabelas
   do front + contrato generate-report) e #194 (auditoria do Deploy).
3. Bancos de rota: manter ratchets dos CI zerados a cada merge.
