# Registro de pendencias — Sentinela_V2

Estrategia: nenhum trabalho parcial de agente de IA e descartado. Item encontrado
= item verificado, integrado ou registrado com dono. Nada e deletado sem prova de
que ja foi incorporado a main ou ficou obsoleto.

## Sessao 2026-11-20 (rota AlertRuleCreate + ViolationDetailPage)

| Item                                                  | Estado                 | Evidencia                                                                                                                                           |
| ----------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rota /alerts/rules/new (AlertRuleCreatePage sem rota) | CONCLUIDO #170         | PR mergeada 2026-11-20; rota registrada em AppRoutes.tsx                                                                                            |
| ViolationDetailPage (stub placeholder)                | CONCLUIDO #171         | PR mergeada 2026-11-20; pagina funcional com timeline/comentarios/disputa                                                                           |
| Testes de auditoria apontando useAuth no AppRoutes    | CONCLUIDO              | Ajustados para src/guards/index.tsx (arquitetura real); 102/102 testes passando                                                                     |
| ApiKeysPage (placeholder sem infra)                   | CONCLUIDO nesta branch | useAgentKeysPage.ts orfao (CRUD agent_keys) + queryKeys faltando; pagina reescrita consumindo o hook e queryKey registrada; 1767/1767 testes verdes |

## Decisoes tecnicas

- Route guards vivem em src/guards/index.tsx (AuthGuard/GuestGuard/AdminGuard/
  SupervisorGuard) e consomem useAuth; AppRoutes so importa os guards. Testes de
  auditoria textual que procuravam `useAuth` no AppRoutes foram corrigidos para
  apontar para o arquivo real.
- ApiKeysPage: useAgentKeysPage.ts (src/hooks) existia completo e orfao — CRUD de
  agent_keys com mutations de criar/revogar/reativar/excluir e copiar — mas a
  pagina era stub e o hook referenciava `queryKeys.agentKeys`, namespace que nao
  existia em src/lib/queryClient.ts (quebraria em runtime). Integrado: queryKey
  registrada + pagina funcional consumindo o hook.
