# Mapa do repositório — referência para agentes

Ler quando precisar saber onde fica algo, **antes** de buscar por texto. Não há grafo de código nem
inventário gerado neste repo (verificado: nenhuma ocorrência de `graphify`, `ai-context`, `inventario`
ou `contexto`), então este arquivo é o índice.

## Onde olhar primeiro

| Precisa de | Leia |
|---|---|
| Estado real medido (drift banco↔repo, tabelas sem RLS, funções invocadas inexistentes, dados zerados em produção) | **`ESTADO_ATUAL.md`** (114 KB; marca cada item como `VERIFICADO` / `NAO_VERIFICADO`) — é a fonte mais confiável do repo |
| Qual banco, migrations, RLS, edge functions, segredos | `AGENTS.md` + `docs/agentes/banco.md` |
| CI, workflows, perímetro do GitHub, por que o CI está vermelho | `docs/agentes/github-ci.md` |
| Para onde o front vai, Docker/k8s/Helm/Terraform, monitoramento | `docs/agentes/deploy-infra.md` |
| Agente desktop (Electron) | `docs/agentes/desktop-agent.md` |
| Regras de domínio que o código não deixa óbvio | `docs/agentes/regras-dominio.md` |
| Plano de SQL/migração rodado em sessões anteriores | `MIGRATION_PLAN_FOR_CLAUDE_WEB.md` |
| Decisões de arquitetura | `docs/adr/001`…`008` |

**`docs/` tem 136 arquivos e não é fonte de verdade.** Há duplicação sistemática de nome entre níveis
(`docs/INSTALLATION.md` × `docs/guides/INSTALLATION.md` × `docs/installation.md`; `ARCHITECTURE.md` ×
`architecture.md`; `API_REFERENCE.md` × `api-reference.md`), vários planos sobrepostos
(`PLANO_IMPLEMENTACAO_*` v14/v18/v20) e afirmações contraditas pelo código (ex.:
`docs/FUNCIONALIDADES_COMPLETAS.md:158` diz que o OCR não precisa de API key, mas
`supabase/functions/ocr-screenshot/index.ts:67` usa `LOVABLE_API_KEY`). Trate `docs/` como contexto
histórico; confirme no código.

**`README.md` está desatualizado**: anuncia versão 19.0.0, React 18, "4.525 arquivos", "1.888 testes",
"100% coverage" e "10.600 commits". Medido no HEAD: `package.json:3` diz `17.0.0`, React é 19
(`package.json`), 1.834 arquivos versionados, 62 arquivos de teste com 1.767 casos (65 falhando) e 658
commits. Não há configuração de cobertura no repo.

## Mapa rápido

| Onde | O que tem |
|---|---|
| `src/` | front Vite + React 19. Entradas: `src/main.tsx`, `src/App.tsx`. Rotas em **`src/routes/AppRoutes.tsx`** (87 `<Route>`, 81 páginas via `lazy()`), paths em `src/constants/routes.ts`, guards em `src/guards/index.tsx` (`AuthGuard`/`GuestGuard`/`AdminGuard`/`SupervisorGuard`) |
| `src/hooks/` | **479 arquivos, tudo plano, sem subpastas** — é o maior diretório do repo; use `ls src/hooks \| grep` antes de criar hook novo (risco alto de duplicata) |
| `src/components/` | 388 arquivos: 99 na raiz + 24 subpastas; `ui/` tem 120 (shadcn/radix) |
| `src/pages/` | 104 arquivos + `admin/`, `dashboard/`, `dev/`, `__tests__/` |
| `src/integrations/supabase/` | `client.ts` (único `createClient`) e `types.ts` (6.368 linhas, gerado) |
| `src/stores/` (34) · `src/types/` (58) · `src/utils/` (64) · `src/lib/` (42) | estado Zustand, tipos, utilitários |
| `supabase/functions/` | 85 edge functions + `_shared/` (`cors`, `auth`, `logger`, `rateLimiting`, `schemas`, `validation`, `halfSpaceTrees`) |
| `supabase/migrations/` | 102 `.sql`, tudo plano — ver `docs/agentes/banco.md` antes de tocar |
| `e2e/` | **1 spec** (`e2e/auth.spec.ts`, 2 testes). Nenhum workflow roda Playwright |
| `desktop-agent/` | app Electron separado, Windows-only, **não é workspace do root** |
| `scripts/` | 23 scripts soltos, **sem README**, 11 deles apontando para alvos inexistentes — ver abaixo |
| `seed/` · `sql/` | fixtures JSON + scripts `.cjs` que escrevem **direto em produção**, e SQL de sondagem |
| `k8s/` `helm/` `terraform/` `monitoring/` `prometheus/` `grafana/` | infraestrutura declarada e **não acionada por nenhum workflow** — ver `docs/agentes/deploy-infra.md` |
| `examples/` | 10 subpastas contendo **só README.md**, zero código |
| `benchmarks/` | 3 arquivos TS que ninguém importa |
| `_smoke/` | 1 PNG, resíduo de screenshot |
| raiz | 12 scripts `.cjs`/`.ps1` de smoke/debug manuais, **com credenciais do projeto escritas dentro** — ver `docs/agentes/banco.md`, seção "Segredos comitados" |

## Comandos

O gerenciador real é **npm** (`package-lock.json` é o único lockfile atualizado junto com o
`package.json`; `bun.lock` e `bun.lockb` estão 2–3 meses atrasados e **quebram** com
`--frozen-lockfile`). Não há `engines` nem `packageManager` em `package.json`; `.nvmrc` fixa Node 20.

- **instalar:** `npm install --legacy-peer-deps`. **`npm ci` falha hoje** com `ERESOLVE`:
  `eslint-plugin-import@2.32.0` aceita `eslint` só até `^9` e o repo tem `eslint@^10.11.0`. É a causa
  do CI vermelho (`docs/agentes/github-ci.md`).
- **typecheck:** `npx tsc --noEmit` (ou `npm run type-check` — note o hífen; `make typecheck` chama
  `npm run typecheck`, que não existe). **Falha hoje com 356 erros herdados** — só erro novo seu conta.
- **lint:** `npx eslint src/ --max-warnings 0` (é o que o CI usa). **Não use `npm run lint`**: o script
  passa `--ext .ts,.tsx`, flag removida no flat config. Hoje o eslint **aborta** mesmo assim
  (`eslint-plugin-react@7.37.5` incompatível com eslint 10: `contextOrFilename.getFilename is not a function`).
- **testes unitários (vitest):** `npx vitest run <caminho>` para só o que você tocou;
  `npx vitest run -t "<nome>"` para um caso. A config do vitest **mora dentro de `vite.config.ts:41-48`**
  (não existe `vitest.config.*`): `environment: jsdom`, `setupFiles: ./src/test/setup.ts`,
  `include: ['src/**/*.{test,spec}.{ts,tsx}']` — por isso `e2e/` e `benchmarks/` ficam fora.
  Estado medido: 62 arquivos, 1.767 casos, **15 arquivos / 65 casos falhando**. `@testing-library/dom`
  é peer não declarada: num install limpo os 62 arquivos falham no import até instalá-la.
- **E2E:** `npx playwright test e2e/auth.spec.ts`. Antes, saiba que **a porta está errada**:
  `playwright.config.ts:11,31` aponta para `http://localhost:5173` e o dev server do Vite escuta
  **8081** (`vite.config.ts:50`). Os `.cjs` de smoke usam 8081.
- **build:** `npm run build` = `bun scripts/generate-audit-pdf.js && vite build` — **exige o binário
  `bun` no PATH** e **regrava `audit_report.pdf`**, que é versionado. Saída em `dist/`.
- **tamanho do bundle:** `npm run bundle-check` → `scripts/check-bundle-size.sh` (limite 512.000 B em
  `dist/assets/*.js`; roda `npm run build` de novo por dentro).
- **testes de contrato Deno** (edge functions): `deno test --allow-env --allow-net` nos 5 arquivos
  `*_test.ts`/`*.test.ts` de `supabase/functions/`.
- **hooks do husky:** `pre-commit` → `npx lint-staged`; `commit-msg` → `commitlint`. Com o eslint
  quebrado, o `pre-commit` falha. Existem **3 configs de lint-staged** (`.lintstagedrc`,
  `.lintstagedrc.json`, `lint-staged.config.cjs`); o lint-staged usa a **primeira** da ordem de busca,
  `.lintstagedrc` — as outras duas estão mortas, e `.js/.jsx`, `.css` e `.yml` não passam por nada.

## `scripts/` — leia antes de rodar

23 arquivos, nenhum subdiretório, **nenhum README**, e só `check-bundle-size.sh` tem bit de execução.
Dois são de fato usados (`check-bundle-size.sh` e `generate-audit-pdf.js`, ambos via `package.json`).
**Nenhum workflow chama `scripts/` nem `make`.** Alvos quebrados confirmados:

- Prisma num projeto Supabase: `db-migrate.sh:3`, `db-seed.sh:3` (Prisma não é dependência) — e
  contradizem `migrate.sh:4` / `seed.sh:4`, que usam o CLI do Supabase.
- `cd mobile-app` em `update-mobile-deps.sh:4` — **`mobile-app/` não existe**.
- `docker-dev.sh:3` usa `docker-compose.dev.yml`, que aponta para `Dockerfile.dev` — **inexistente**.
- Scripts npm inexistentes: `build-all.sh:4` (`build:storybook`), `pre-commit.sh:19` (`test:changed`),
  `health-check.sh:16` (`db:check`), `init-db.sh:17,20` (`db:migrate`, `db:seed`).
- `analyze-bundle.sh:3` passa `--analyze`, que o script `build` não aceita; e `vite-bundle-visualizer`,
  usado por `npm run analyze`, **não está nas devDependencies**.
- `setup.sh:5` copia `.env.example` para `.env.local`, mas o `.env.example` descreve outro backend e
  **não contém** as variáveis que o código lê.

`Makefile`: **11 dos 20 alvos** chamam scripts npm que não existem (`test-watch`, `test-coverage`,
`typecheck`, `db-migrate`, `db-seed`, `db-reset`, `e2e`, `e2e-ui`, `storybook`, e os `docker-*`, que
usam o `Dockerfile` quebrado). Use os comandos da seção acima, não o Makefile.

Automação nova vai em `scripts/<nome>/` com `README.md` dizendo o que faz, como rodar e que secrets
usa — nunca solta na raiz de `scripts/`, nunca em `supabase/` (o CLI é dono dessa pasta) nem em `src/`
(entra no bundle).

## Convenções de TypeScript que surpreendem

- **`tsconfig.json` é o único que vale** (`tsc --noEmit` o usa). `include: ["**/*.ts","**/*.tsx"]` —
  cobre o repo inteiro, não só `src/`. `strict: true` mas com `noImplicitAny: false`,
  `noUnusedLocals: false`, `noUnusedParameters: false`.
- `tsconfig.app.json` e `tsconfig.node.json` são **órfãos**: não há `references` em nenhum arquivo e
  nenhum script os aponta com `-p`. Divergem do principal (`strict: false`, `target ES2020`).
- `tsconfig.json` declara **10 path aliases** (`@/*`, `@components/*`, `@hooks/*`, `@lib/*`,
  `@stores/*`, `@types/*`, `@utils/*`, `@helpers/*`, `@constants/*`, `@validators/*`) mas
  `vite.config.ts:9-11` resolve **apenas `@`** — os outros 9 compilam e quebram no bundle. Use só `@/`.
- `@testing-library/react`, `jest-dom` e `user-event` estão em `dependencies`, não em
  `devDependencies` — vão para o bundle de produção se alguém importar fora de teste.
