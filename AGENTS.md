# AGENTS.md — Sentinela V2

Regras do dono para qualquer agente de IA; vencem `docs/` (histórico) e `README.md` (desatualizado).
Detalhe em `docs/agentes/<tema>.md`; divergiu da realidade → corrija no mesmo PR do fix. Responda
sempre em PT-BR.

## Postura
- O dono não é dev: decide negócio; o agente executa a engenharia inteira via MCP. Nunca passo manual
  do dono nem pedir que ele revise diff.
- Qualidade + velocidade, mínimo de tokens. Decida como dev sênior; pergunte só com custo, arquitetura,
  dado destrutivo em produção, trade-off de negócio ou item "chame o dono". Para ler, não peça permissão.
- Verdade acima de validação: não sabe → diga; falhou → diga. Afirmação sobre código cita evidência
  (arquivo:linha, diff, saída de comando); sem evidência = "NÃO VERIFICADO" + motivo; nunca "testado" sem
  ter rodado. Branch/commit/PR não provam nada — leia o código.
- Diff mínimo, zero churn: causa raiz, não reescrita; não refatore, renomeie ou comente o que não foi pedido;
  não reescreva arquivo inteiro para mudar 3 linhas. Dependência nova ou bump major só se indispensável (avise na PR).
- `APROVADO` = execute o plano como descrito, sem reconfirmar.
- Uma tarefa por vez, cada uma com sua branch/PR. Outro bug → "Próximos passos". Travou → reporte o erro
  exato e pare; não contorne regra. Releia o pedido antes de concluir.
- Tokens: leia só o trecho necessário; `docs/agentes/mapa-repo.md` antes de buscar por texto; exploração
  ampla → subagente; nenhuma tool "por garantia"; não gere código que não será aplicado.
- Segredos nunca em código, commit ou resposta — só em env/secret do serviço (`supabase secrets set` ou
  painel). **Este repo já tem segredos comitados** (PAT, JWT `service_role`, chave da `migrate-helper`):
  ver `docs/agentes/banco.md`. Nunca imprima nem reproduza o valor; cite `arquivo:linha` + tipo.

## Bugs e funcionalidades
- Diagnóstico antes de patch: logs e estado real, ponto exato (arquivo:linha), causa; várias causas → liste
  todas, corrija a pedida.
- Antes da PR: lint e teste **do que você tocou** (`npx eslint <arquivos>`, `npx vitest run <caminho>`).
  Só erro seu conta. Herdado da `main` → "Próximos passos": hoje `npm ci` falha (ERESOLVE do eslint 10),
  `npx eslint` aborta (`eslint-plugin-react` incompatível), `tsc --noEmit` tem 356 erros e 15 arquivos de
  teste falham. **Todos os workflows estão vermelhos** — detalhe e causa em `docs/agentes/github-ci.md`.
- "Pronto" = PR mergeada + deploy confirmado + comportamento verificado (log, query ou request real); faltou
  um → diga onde parou. Aqui "deploy confirmado" exige olhar a Vercel: o workflow de deploy usa secrets que
  não existem (`docs/agentes/deploy-infra.md`).
- Funcionalidade pronta = integrada ponta a ponta (rota em `src/constants/routes.ts` + `<Route>` em
  `src/routes/AppRoutes.tsx` + entrada na UI, hook/edge chamados, tabela existindo **com RLS**, estados
  erro/loading/vazio, submit), sem mock, hardcode ou TODO. Pela metade não é pronto; não cabe na sessão →
  entregue o funcional e liste o que falta, em ordem, com arquivos. Nunca deixe código morto ou feature
  "quase" sem dizer.

## Comunicação
- Resultado primeiro, só o que muda decisão do dono. Sem introdução, recapitulação, narração, hedging,
  disclaimer, lição de moral ou cortesia. Efeito no negócio; técnica só se perguntarem. Resposta e plano
  proporcionais ao tamanho do fix; não despeje log — cite a linha que importa. Caminhos, comandos e links
  completos. Destrutivo de verdade: uma linha ("isso apaga X, sem volta — confirma?").
- Toda execução fecha com exatamente 3 "Próximos passos" (`N. [título] — [por quê] · [arquivo]`), por
  impacto, do que você viu, executáveis via MCP, para não-dev; nada de genérico ("adicionar testes",
  "melhorar documentação", "revisar segurança"). É um menu: `1`, `1 e 3`, `APROVADO 2`, "todos" ou o bloco
  devolvido = executar na ordem, sem reconfirmar. Só consulta, já rejeitadas ou nada pendente →
  `Próximos passos: nada pendente neste escopo.`

## Fluxo Git — detalhe em `docs/agentes/github-ci.md`
- Repo `adm01-debug/Sentinela_V2`, `main`, **privado**. Escrita no GitHub: MCP **`GITHUB - MCP - FOREVER`**
  (`github_push_files`: `files` + `delete` num commit); `git push`/`gh` só em repo autorizado na sessão.
- Nunca commite em `main`. Só escreva em branch que **você** criou nesta sessão; branch alheia ou já
  existente é somente leitura. Antes do push, confira que o último commit é seu.
  **`main` não tem branch protection** (API responde 404): a proibição é regra, não trava técnica.
- PR aberta nos mesmos arquivos → pare e avise o dono (liste via `github_graphql`).
- Branch de `main` atualizado: `claude/<fix|feat|chore|infra>-<slug>-<AAMMDD-HHMM>`.
- Commit PT-BR, 1 atômico, `<tipo>(<escopo>): <assunto>`; tipos só os do `commitlint.config.cjs`
  (`feat fix docs style refactor perf test chore revert ci build` — **não há `security` nem `infra`**;
  branch `infra` → `ci:`/`chore:`).
- PR sempre: título = o que muda; corpo = causa + o que foi verificado, com evidência.
- Mergeie sem aprovação (squash) PR sua pronta: sem conflito, escopo comum (front, edge, config).
  **Auto-merge está desligado** neste repo e `delete_branch_on_merge=false` — mergeie explicitamente e
  **apague a branch**. "CI verde" hoje é impossível: use "sem erro novo seu" como critério e diga isso na PR.
  **Deixe aberta e chame o dono**: DDL/migration em produção; CI/workflows, segredos, Dockerfile, k8s/Helm/
  Terraform; deleção de dado, arquitetura ou custo; conflito com PR de outro agente.
- Conflito: rebase em `main`; `--force-with-lease` só na sua branch.
- Merge em `main` pode ser produção (Vercel ligada ao repo): confira o deploy e reporte — não conseguiu
  confirmar, diga "não verificado". Fim: link da PR + estado.

## Banco — ler `docs/agentes/banco.md` antes de SQL, migration, RLS ou deploy de edge function
- Oficial: Supabase Cloud **`jgnmwvzephsozsqmcpzb`** ("Sentinela - V2").
- **NÃO escrever** em `ybvdtjpyolbnjirjrthe` (está no `supabase/config.toml:1` e é o default do CLI — todo
  comando precisa de `--project-ref jgnmwvzephsozsqmcpzb`) nem em `rmiznlzpbwqpbzaiyydw`
  (`desktop-agent/src/config.ts:3`). MCPs "GESTÃO DE CLIENTES"/"GESTÃO DE PRODUTOS" são de outros produtos.
- Diagnóstico = produção só leitura; teste = Postgres descartável. O dev server **aponta para produção**
  (não há desvio para banco local no client). DDL: arquivo → PR → merge → apply; nunca de branch aberta.
- **O ledger `supabase_migrations.schema_migrations` não existe** e as 102 migrations não são rastreadas
  (`ESTADO_ATUAL.md:263-264`): o banco ao vivo é a verdade, o repo é aproximação. Confirme estrutura por
  `pg_get_functiondef`/`pg_indexes`/`information_schema`, nunca por leitura de migration.
- Destrutivo, segredos e rotação: só com o dono.

## Serviços
- **Vercel** — ler `docs/agentes/deploy-infra.md` ao confirmar deploy ou mexer em env/domínio. Projeto
  `sentinela-v2`, team `juca1`; **não há `vercel.json`** no repo. Nunca segredo de servidor na Vercel;
  `VITE_*` é público. Os três `.env*.example` discordam entre si e do código.
- **GitHub/CI** — ler `docs/agentes/github-ci.md` ao mexer em `.github/`, settings ou workflows. Perímetro
  medido lá (sem branch protection, 3 environments sem regra, 8 secrets referenciados que não existem).
  Mudou perímetro → atualize a tabela na mesma PR.
- **Agente desktop (Electron)** — ler `docs/agentes/desktop-agent.md` ao mexer em `desktop-agent/` ou na
  coleta. Windows-only, roda como administrador, aponta para outro projeto Supabase.
- **Regras de domínio** — ler `docs/agentes/regras-dominio.md` ao mexer em permissões, papéis, dashboard
  ou dados de seed. Resumo: guards liberam por sufixo de e-mail, `get_user_permissions` é stub vazio e os
  gráficos do dashboard são constantes.
- **Infra declarada e inerte** (Docker, k8s, Helm, Terraform, Prometheus, Grafana, Sentry, Codecov,
  semantic-release): nenhum workflow a aciona e boa parte está quebrada. Não "conserte" o que não foi
  pedido — registre em "Próximos passos".

## Stack e comandos — detalhe em `docs/agentes/mapa-repo.md`
- Vite + React 19 + TS (`src/`), Supabase (`supabase/functions/` com 85 edges, `supabase/migrations/` com
  102 SQL), Playwright (`e2e/`, 1 spec), Electron (`desktop-agent/`), **npm** (Node 20).
- `npm install --legacy-peer-deps` (**`npm ci` falha**: ERESOLVE eslint 10 × `eslint-plugin-import`);
  `npx tsc --noEmit`; `npx eslint src/ --max-warnings 0` (**não** `npm run lint`: usa `--ext`, inválido no
  flat config); `npx vitest run <caminho>` (config do vitest mora em `vite.config.ts:41-48`);
  `npx playwright test` (ciente de que o config aponta 5173 e o Vite serve 8081);
  `npm run build` exige o binário **bun** e regrava `audit_report.pdf`.
- Antes de qualquer tarefa: `ESTADO_ATUAL.md` (estado real medido, marcado VERIFICADO/NAO_VERIFICADO) e
  `docs/agentes/mapa-repo.md`. `README.md` e `docs/` estão desatualizados e se contradizem.
- Automação em `scripts/<nome>/` com README (leia antes de alterar); nunca em `supabase/` nem `src/`.
  Os 23 scripts soltos em `scripts/` e 11 dos 20 alvos do `Makefile` apontam para alvos inexistentes.

## Grafo de código
**Não existe grafo de código, inventário gerado nem branch de contexto neste repo** (verificado: nenhuma
ocorrência de `graphify`, `ai-context`, `inventario` ou `contexto`). O índice é `docs/agentes/mapa-repo.md`:
leia a tabela "Onde olhar primeiro" e o "Mapa rápido" **antes** de `grep` amplo, e `ESTADO_ATUAL.md` antes
de concluir qualquer coisa sobre o banco. `src/hooks/` tem 479 arquivos planos — procure antes de criar.
