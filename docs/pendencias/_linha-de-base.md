# Linha de base - estado real de Sentinela_V2

Atualizado em 2026-11-21 (sessao autopilot - merge #181/#182 + homologacao WhatsApp).
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

| Item                      | Estado                                             | Evidencia                              |
| ------------------------- | -------------------------------------------------- | -------------------------------------- |
| send-whatsapp             | DEPLOYADA v2 (roteador dual Meta/Evolution)        | invoke POST: resposta do codigo novo   |
| sync-whatsapp-templates   | DEPLOYADA (46 no total)                            | invoke antes 404 -> agora 401 sem auth |
| award-gamification-points | DEPLOYADA (versao main, valida reason/description) | Restaurada de origin/main; sem alterar |

## Deploy / producao

| Item                         | Estado                                      | Evidencia                                            |
| ---------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| Site sentinela-v2.vercel.app | NO AR (200)                                 | Deploy nativo Git<->Vercel entrega main be9b6b468    |
| Workflow Actions "Deploy"    | VERMELHO (causa externa)                    | "Could not retrieve Project Settings" em todo run    |
| Erro Deploy (diagnostico)    | Token/identidade Vercel do Actions invalida | mesmo YAML verde 11:52 -> falha 13:29 em commit docs |

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

1. Obter token Evolution GO (Zapp) ou Meta e homologar WhatsApp E2E (preencher
   whatsapp_config na UI /integrations/whatsapp e enviar teste).
2. Rotacionar VERCEL_TOKEN do Actions para desbloquear o Deploy automatico.
3. Bancos de rota: manter ratchets dos CI zerados a cada merge.
