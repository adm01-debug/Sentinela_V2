# Registro de pendencias — Sentinela_V2

Estrategia: nenhum trabalho parcial de agente de IA e descartado. Item encontrado
= item verificado, integrado ou registrado com dono. Nada e deletado sem prova de
que ja foi incorporado a main ou ficou obsoleto.

## Sessao 2026-11-20 (rota AlertRuleCreate + ViolationDetailPage)

| Item                                                  | Estado                            | Evidencia                                                                                    |
| ----------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------- |
| Rota /alerts/rules/new (AlertRuleCreatePage sem rota) | CONCLUIDO #170                    | PR mergeada 2026-11-20; rota registrada em AppRoutes.tsx                                     |
| ViolationDetailPage (stub placeholder)                | CONCLUIDO #171                    | PR mergeada 2026-11-20; pagina funcional com timeline/comentarios/disputa                    |
| Testes de auditoria apontando useAuth no AppRoutes    | CONCLUIDO                         | Ajustados para src/guards/index.tsx (arquitetura real); 102/102 testes passando              |
| ApiKeysPage (placeholder sem infra)                   | PENDENTE — feature nunca iniciada | type src/types/apiKey.ts orfao; sem tabela/hook/servico. Nao ha trabalho parcial a preservar |

## Decisoes tecnicas

- Route guards vivem em src/guards/index.tsx (AuthGuard/GuestGuard/AdminGuard/
  SupervisorGuard) e consomem useAuth; AppRoutes so importa os guards. Testes de
  auditoria textual que procuravam `useAuth` no AppRoutes foram corrigidos para
  apontar para o arquivo real.
- ApiKeysPage: rota ROUTES.SETTINGS_API existe e tipa permission 'api_keys', mas
  nao ha backend (tabela api_keys, hook, servico). Construir a feature do zero
  caso o negocio priorize; nao existe trabalho parcial de outro agente.
