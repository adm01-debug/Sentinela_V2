# Linha de base â€” estado real de Sentinela_V2

Atualizado em 2026-11-??. Todo item listado foi verificado com evidencia real
(banco, RPC, edge function ou merge). Estrategia: nenhum trabalho parcial de
agente de IA e descartado; item parcial e continuado ou registrado com dono.

## Banco de dados (projeto jgnmwvzephsozsqmcpzb)

| Item                                                    | Estado                   | Evidencia                                                        |
| ------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------- |
| Migration #168 entity_versions (view latest_versions)   | APLICADA e validada      | View existe; anon sem leitura; SELECT autenticado OK             |
| whatsapp_templates + whatsapp_config (RLS ON, triggers) | APLICADA e validada      | CRUD real (insert/update/delete) OK; REST 404 -> 200             |
| supabase_migrations.schema_migrations                   | 104/104 alinhado ao repo | Registradas 20261120133000 e 20261121120000                      |
| get_user_permissions / has_permission / has_role        | EXISTEM no banco         | has_permission e get_user_permissions com EXECUTE anon (risco)   |
| check_permission                                        | NAO existe (0)           | Migration granular_roles nunca aplicada (ou drop); front nao usa |

## Edge functions

| Item                      | Estado                                             | Evidencia                              |
| ------------------------- | -------------------------------------------------- | -------------------------------------- |
| sync-whatsapp-templates   | DEPLOYADA (46 no total)                            | invoke antes 404 -> agora 401 sem auth |
| award-gamification-points | DEPLOYADA (versao main, valida reason/description) | Restaurada de origin/main; sem alterar |

## Faltantes / bloqueios

- Credenciais Meta reais (phone_number_id + access_token) para homologar WhatsApp
  de ponta a ponta: nao existem na organizacao; secrets do projeto sem WHATSAPP_*.
- Permissoes: has_permission/get_user_permissions executaveis por anon em funcoes
  sensiveis (SECURITY DEFINER) â€” gap de seguranca a endurecer com aval.
- Guards do front (src/guards) liberam por email @securitywatch.com (backdoor
  documentado em docs/agentes/regras-dominio.md); nao remover sem plano de
  migracao dos usuarios reais.

## Auxiliares orfaos

- sql/create_missing_rpcs.sql: nao referenciado por codigo/script; funcionalidade
  (has_role) ja existe em producao. Pode ser descartado ou movido para docs.

## Proximos passos registrados

1. Obter credenciais Meta e homologar WhatsApp E2E (preencher whatsapp_config).
2. Endurecer permissao (REVOKE EXECUTE anon) e decidir destino dos guards.
3. Bancos de rota: manter ratchets dos CI zerados a cada merge.
