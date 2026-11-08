# Regras de domínio que o código não deixa óbvio — referência para agentes

Ler quando mexer em permissões, papéis, dashboard, violações ou dados de seed. Tudo aqui foi
verificado no código do HEAD; cada item traz `arquivo:linha`.

## Autorização — não confie no que o nome do guard promete

- `AdminGuard` e `SupervisorGuard` liberam acesso **por sufixo de e-mail**:
  `user?.email?.endsWith('@securitywatch.com')` (`src/guards/index.tsx:47` e `:63`). Quem tiver e-mail
  nesse domínio é admin na UI, independente de papel no banco. Mexer em papéis sem remover essa
  condição não muda nada na prática.
- Os guards decidem **no client**, lendo `user?.role` / `user?.isAdmin` do `useAuth`. A barreira real
  é RLS no banco (`docs/agentes/banco.md`) — nunca trate o guard como controle de acesso.
- **Vocabulário de papéis inconsistente:** `src/constants/roles.ts` define
  `admin | manager | user | viewer`, mas os guards checam `admin` e **`supervisor`**, que não existe na
  constante. Antes de adicionar papel, decida qual lista é a canônica.
- **Permissões granulares estão zeradas por construção:** `src/hooks/useGranularPermissions.ts:309`
  chama a RPC `get_user_permissions`, cuja definição no repo
  (`sql/create_missing_rpcs.sql:45-53`) é um **stub que retorna `ARRAY[]::text[]`**. Qualquer tela que
  dependa da lista de permissões recebe vazio. O mesmo hook chama `has_permission` em `:284` — nome
  diferente de `check_permission`, que `ESTADO_ATUAL.md:265-266` lista como declarada e ausente do
  banco.
- `sql/create_missing_rpcs.sql:55` concede `EXECUTE` de `has_role(uuid, app_role)` também ao papel
  **`anon`**.

## Dashboard — os gráficos são constantes, não dados

`src/pages/dashboard/DashboardCharts.tsx:34` e `:56` passam `fallbackActivityData` e
`fallbackProductivityData` **direto** para os gráficos, sem nenhuma query por trás — as duas
constantes vivem em `src/pages/dashboard/dashboardData.ts:5-18,20-27`. O nome diz "fallback", mas não
há caminho alternativo: é o que a tela sempre mostra.

Contexto registrado em `ESTADO_ATUAL.md:214-241`: a origem disso é `activity_logs` e
`productivity_logs` estarem com **0 registros** em produção na medição de 16/08/2026. Antes de "ligar"
o dashboard, confirme se as tabelas têm dado — ou a tela troca número inventado por gráfico vazio.

## Edge functions que o front chama e não existem

`ESTADO_ATUAL.md:285-291` (§5.5), confirmado contra as 85 pastas de `supabase/functions/`:
`sync-whatsapp-templates` e `award-gamification-points` são invocadas pelo front e **não existem**.
Toda chamada a elas falha em runtime.

## Dados de seed — contêm dado real e apontam para produção

- `seed/` tem fixtures JSON **e** scripts `.cjs` que escrevem direto no projeto de produção
  (`docs/agentes/banco.md`). Rodar um script de `seed/` por engano grava em produção.
- `seed/internet_access_settings.json:2-6` tem nomes próprios de colaboradores, UUIDs e o domínio de
  um cliente real. `seed/session_recordings.json:7` tem até o ref do projeto dentro de um
  `window_title`. **Não publique conteúdo de `seed/` em resposta, issue ou PR.**
- Não existe fixture de E2E em produção para preservar (o único spec, `e2e/auth.spec.ts`, só abre a
  tela de login) — diferente de outros repos da casa.

## LGPD / privacidade

- `supabase/functions/delete-user-data` é o caminho de exclusão de dados do titular; mexer nele é
  mudança de contrato de compliance → chame o dono.
- `docs/DATA_PRIVACY.md` e `VPAT.md` descrevem compromissos que o código não necessariamente cumpre;
  trate como intenção, não como estado.
- O agente desktop captura tela, teclas e janelas ativas (`docs/agentes/desktop-agent.md`): qualquer
  mudança no que é coletado é decisão de negócio, não de engenharia.

## UI

- Rotas vêm de `ROUTES` em `src/constants/routes.ts`; `PUBLIC_ROUTES` é a lista que escapa do
  `AuthGuard`. Rota nova = entrada em `ROUTES` + `<Route>` em `src/routes/AppRoutes.tsx` + entrada no
  menu, senão a tela existe e ninguém chega nela.
- As 81 páginas entram por `lazy(() => import(...))` dentro de `RouteErrorBoundary` + `Suspense` com
  `BrandedSplash` — ao adicionar página, siga o mesmo padrão ou o bundle inicial cresce.
- `src/hooks/` tem 479 arquivos planos: **procure antes de criar** (`ls src/hooks | grep <tema>`). Há
  famílias de hooks com nomes quase iguais.
