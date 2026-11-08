# Scripts autônomos — estado real do repositório

Maquinaria portada de `adm01-debug/Zapp_Web_V2`, onde ela existe como **733 arquivos em `scripts/`
(216 executáveis + 453 suítes de teste)** em 23 pastas, orquestrados por 22 workflows. O objetivo é um só:
manter no repositório um retrato medido do que existe, para que agente de IA não gaste tokens
redescobrindo o projeto nem trabalhe sobre documentação velha.

## As três engrenagens do Zapp Web V2

| engrenagem | cadência | o que regenera | como entrega | portada aqui? |
|---|---|---|---|---|
| **Contexto para IA** (`contexto.yml`) | a cada 10 min + push em main | `docs/contexto/codigo/` (gerador de 923 linhas: rotas, menu, módulos, componentes, hooks, edges, banco, testes, CI, convenções), `docs/contexto/supabase/` (snapshot do banco vivo), `docs/contexto/regras/` (regras de negócio), `00-INDEX.md` | push direto na branch gerada `contexto` (commit `[skip ci]`) | **parcial** — só a fonte `codigo/` (Fase 1) |
| **Inventário do estado** (`inventario-estado-semanal.yml`) | segunda 10:23 UTC | `inventario/estado/{banco,rotas,edges}.json` | PR em `automation/inventario-estado`, só se mudou de verdade | **parcial** — só `edges.json` (Fase 1) |
| **Sincronia com o banco** (`types-sync.yml`) | segunda 05:49 UTC + push em migrations | `src/integrations/supabase/types.ts`, `supabase/schema-catalog.json`, `supabase/schema-manifest.json`, `grants-baseline.json`, `known-violations.json`, validados por 3 gates antes de propor | PR em `automation/types-sync` | **não** (Fase 3) |

Complementos do Zapp: `talkx-status-regen.yml` (placar por PR), `db-live-guard.yml` (contrato do banco de
produção semanal, só leitura, reporta por issue), `settings-guard.yml` (perímetro do GitHub contra baseline
versionado), `branch-hygiene-audit.yml` (branches podáveis, SLA de code scanning), `auto-update-pr-branch.yml`
(fila de merge serial), 40 guards/ratchets em `scripts/ci/` com baselines (`eslint-baseline.json` 680 KB,
`typecheck-baseline.json` 50 KB) e 316 arquivos de auditoria de banco em `scripts/db-audit/` — 209 deles
provas que sobem um PostgreSQL 17 descartável em Docker, nunca tocando produção.

## Fase 1 — portada (esta PR)

| arquivo | origem no Zapp | estado |
|---|---|---|
| `scripts/ai-context/gerar.mjs` | idêntico | roda sem adaptação; mediu 1829 arquivos, 54 rotas, 56 módulos, 523 hooks, 85 edges, 138 tabelas, 65 arquivos de teste |
| `scripts/ai-context/gerar.unit.mjs` | idêntico | 17 testes, todos passando aqui |
| `scripts/ai-context/cenarios.mjs` | idêntico | fuzz do gerador contra repos sintéticos (manual) |
| `scripts/inventario/gerar-repo.mjs` | idêntico | roda sem adaptação; 85 edges, 47 sem chamador no código |
| `scripts/inventario/mudou-conteudo.mjs` | idêntico | decide se vale abrir PR |
| `ai-context.config.json` | adaptado | só o rodapé de publicação |
| `.github/workflows/contexto.yml` | reescrito, 1 job | gera `codigo/` e publica na branch `contexto`; cron `7-59/30` para não colidir com `security-scan` (0 0 * * *) |
| `.github/workflows/inventario-estado-semanal.yml` | reescrito, 1 job | cron `31 10 * * 1`, PR em `automation/inventario-estado` |

Como consultar o contexto depois do primeiro run, sem clonar nada:
`https://raw.githubusercontent.com/adm01-debug/Sentinela_V2/contexto/docs/contexto/codigo/INDEX.md`

Nada toca `package.json` nem os workflows existentes: as PRs abertas #90 e #91 mexem nesses arquivos.
Os comandos rodam direto (`node scripts/ai-context/gerar.mjs`), sem script de npm.

## Fase 2 — falta (precisa de credencial ou adaptação)

1. `scripts/inventario/gerar-banco.mjs` + `banco.sql` → `inventario/estado/banco.json`. Trocar o
   project ref fixo (`tnnnlkbymytvtqngbbqh` → `jgnmwvzephsozsqmcpzb`) e ter `SUPABASE_ACCESS_TOKEN`
   como secret, ou alimentar por `--entrada` com a resposta do MCP.
2. `scripts/inventario/gerar-rotas.mjs` → `inventario/estado/rotas.json`. **Precisa reescrita**: lê
   `src/pages/ViewRouter.tsx`, `lazyViews.ts` e `navigation.service.ts`, que não existem aqui
   (este repo usa `src/routes/AppRoutes.tsx` + `src/constants/routes.ts`).
3. `scripts/supabase_snapshot/snapshot.py` → `docs/contexto/supabase/**` (retrato do banco vivo:
   catálogo, RLS, functions, cron, storage, grants, lints). Exige `SUPABASE_DB_URL` em sessão read-only.
4. `scripts/regras_negocio/{generate,indice}.py` → `docs/contexto/regras/` + `00-INDEX.md`.

## Fase 3 — falta (guards e ratchets)

Da lista de 40 executáveis de `scripts/ci/` do Zapp, os que valem aqui porque este repo tem a mesma
dívida (`npm ci` falhando, 356 erros de `tsc`, 15 arquivos de teste quebrados, workflows vermelhos):

| script | para quê |
|---|---|
| `lint-ratchet.mjs` | congela a dívida de ESLint num baseline e falha só em ocorrência nova |
| `typecheck-ratchet.mjs` | o mesmo para os erros de tipo — permite PR verde sem consertar os 356 de uma vez |
| `implicit-any-ratchet.mjs` | impede novo `any` implícito |
| `check-test-inventory.mjs` | todo arquivo de teste tem de ser citado em algum workflow (hoje ninguém sabe o que roda) |
| `render-workflow-docs.mjs` | projeta `docs/ci/README.md` dos cabeçalhos dos workflows, com `--check` |
| `check-workflow-pins.mjs` + `allowed-actions.json` | exige action pinada por SHA de 40 hex |
| `github-settings-guard.mjs` + baseline | perímetro do GitHub versionado (este repo **não tem branch protection**) |
| `check-bundle-secrets.mjs` | reprova JWT `service_role` no bundle publicado |
| `check-edge-error-exposure.mjs` | nenhuma edge devolve `err.message`/stack cru em 5xx |
| `commit-msg-lint.mjs` | Conventional Commits sem dependência (o repo usa commitlint hoje) |

`check-claude-md-integrity.mjs` já existe aqui (`scripts/ci/`), portado antes.

## Armadilhas medidas no Zapp (não repetir)

- `contexto.yml` sai **verde sem o banco**: sem o secret o job do snapshot só avisa e mantém o retrato
  antigo. Se portar a Fase 2, trate secret ausente como falha em `workflow_dispatch`.
- Push direto em `main` para artefato gerado é recusado (GH006): por isso `types-sync`,
  `talkx-status-regen` e `inventario-estado-semanal` entregam por PR e só a branch `contexto`
  recebe push.
- `HUSKY: '0'` no step do `create-pull-request`: o hook `pre-push` bloqueia o push interno da action.
- 23 dos 40 guards do Zapp só rodam pelo passo-glob `node --test scripts/ci/*.unit.mjs`; 3 não rodam
  em lugar nenhum. Guard sem acionador é documentação, não gate.
