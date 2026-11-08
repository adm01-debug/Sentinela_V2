# GitHub (perímetro, CI, workflows) — referência para agentes

Ler quando mexer em `.github/`, abrir/mergear PR, ou quando um workflow falhar. Comece pelo fato
central: **hoje todos os workflows deste repo terminam em `failure`** — CI, Lint, Preview, Deploy, CD,
Security Scan e Update Dependencies. "Esperar CI verde" não é critério utilizável aqui até que as
causas abaixo sejam corrigidas.

## Escrita no GitHub

- Repo `adm01-debug/Sentinela_V2`, branch `main`, **privado**, licença MIT, homepage
  `https://sentinela-v2.vercel.app`.
- **Escrita: MCP `GITHUB - MCP - FOREVER`** (`github_push_files`: aceita `files` e `delete` no mesmo
  commit, 1 commit atômico). O MCP padrão do GitHub retorna 403 em write. `git push` só funciona se o
  repo estiver entre as fontes autorizadas da sessão.
- Commit: `<tipo>(<escopo>): <assunto>` em PT-BR, imperativo. Tipos aceitos pelo `commitlint.config.cjs`
  (hook `commit-msg`): `feat fix docs style refactor perf test chore revert ci build` — **não há
  `security` e não há `infra`**; branch `infra` → commit `ci:` ou `chore:`. `subject-max-length: 100`;
  `subject-case` proíbe start/pascal/upper case. Via MCP o hook não roda — siga o padrão mesmo assim.
- Para listar PRs abertas com os arquivos que tocam numa chamada só, use `github_graphql`
  (`pullRequests(states:OPEN){ nodes { number files { nodes { path } } } }`).

## Perímetro do GitHub — estado canônico

Qualquer mudança nos campos abaixo atualiza **esta tabela** no mesmo PR.

| Campo | Estado canônico (medido) |
|---|---|
| Branch protection em `main` | **NÃO EXISTE** — a API responde `404 Branch not protected`. Sem required check, sem revisão obrigatória, sem histórico linear. Push direto em `main` é tecnicamente possível: a proibição é regra do dono, não trava técnica |
| Merge | `allow_squash_merge=true` · `allow_merge_commit=true` · `allow_rebase_merge=true` · **`allow_auto_merge=false`** · **`delete_branch_on_merge=false`** · `allow_update_branch=false` |
| Squash | `squash_merge_commit_message=COMMIT_MESSAGES` · `squash_merge_commit_title=COMMIT_OR_PR_TITLE` |
| Environments | **3**: `copilot` · `Preview` · `Production` — **nenhum** com protection rule, nenhum com deployment branch policy, `can_admins_bypass=true`, e **nenhum com secret** |
| Actions | `enabled=true` · `allowed_actions=all` · **`sha_pinning_required=false`** |
| Secrets do repo | **3**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` |
| Variables do repo | **0** |

Consequências que custam retrabalho se ignoradas:

- **Auto-merge está desligado** (`allow_auto_merge=false`): não existe "marcar auto-merge e sair" neste
  repo. Merge é chamada explícita. E como `delete_branch_on_merge=false`, **apague a branch você**
  depois do squash.
- **Os 3 secrets que existem não são usados por nenhum workflow** (nenhum `.github/workflows/*`
  menciona `SUPABASE`).
- **Os 8 secrets que os workflows usam não existem**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`,
  `VERCEL_PROJECT_ID` (`deploy.yml:22-24`), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`,
  `CLOUDFRONT_ID` (`cd.yml:15-17`), `SNYK_TOKEN` (`security.yml:14`). Nem no repo, nem nos
  environments. Portanto **nenhum deploy automatizado pode estar funcionando por workflow** — ver
  `docs/agentes/deploy-infra.md`.
- **Nenhum workflow declara `permissions:`.** CodeQL precisa de `security-events: write`,
  `release.yml` de `contents: write`, `update-deps.yml` de `contents: write` + `pull-requests: write`.
- **Nenhum workflow usa `needs:`.** Não há encadeamento CI → deploy: `deploy.yml` dispara em todo push
  para `main` sem depender do `CI`.

## Por que está vermelho (causa raiz reproduzida)

1. **`CI` (jobs `quality`, `build`, `test`) morre no passo `npm ci`.** Reproduzido localmente:
   `npm error code ERESOLVE … Conflicting peer dependency: eslint@9.39.5 … peer eslint@"^2 || … || ^9"
   from eslint-plugin-import@2.32.0`, contra `eslint@^10.11.0` em `package.json`. Nenhum dos 3 jobs
   Node passa do passo 4. Workaround local: `npm install --legacy-peer-deps`.
2. **O mesmo bump de eslint 10 quebra o lint em si**: `npx eslint` aborta com
   `TypeError: Error while loading rule 'react/display-name': contextOrFilename.getFilename is not a
   function` (`eslint-plugin-react@7.37.5` não suporta eslint 10). Vale para `ci.yml:27`,
   `lint.yml:23` e o `pre-commit`.
3. **`Security Scan` falha com `CodeQL job status was configuration error`** (run de 2026-11-08), além
   do aviso `Resource not accessible by integration` — coerente com a ausência de `permissions:`.
4. **`npm run build` exige o binário `bun`** (`package.json:7` roda `bun scripts/generate-audit-pdf.js`
   antes do `vite build`) e **nenhum workflow instala bun** (não há `oven-sh/setup-bun` em
   `.github/workflows/`). É o próximo bloqueio depois do `npm ci`.
5. **`deno-contract-tests` falha por teste que exige stack local do Supabase.**
   `supabase/functions/agent-collector/agent-collector_test.ts` faz request HTTP para
   `http://localhost:54321/functions/v1/agent-collector`; o job nunca sobe `supabase start`, então dá
   `Connection refused (os error 111)` → `error: Test failed`. Como o step é
   `find … | xargs -I {} deno test {}`, o `xargs` encerra com **exit 123** mesmo com os outros
   arquivos passando (os 5 testes de `check-geofence/contract_test.ts` passam). São 5 arquivos de
   teste em `supabase/functions/`: `send-webhook`, `agent-collector` (2), `mobile-collector`,
   `check-geofence`. Este job **não** usa `npm ci`, então essa falha é independente do ERESOLVE.

Quando o CI estiver verde de novo, atualize esta seção no mesmo PR.

## Workflows — 12 arquivos (+ Dependabot e Copilot, dinâmicos)

| Arquivo | `name:` | Gatilho | O que faz | Estado |
|---|---|---|---|---|
| `ci.yml` | `CI` | push/PR em `main` | 4 jobs paralelos: `quality` (eslint `src/` max-warnings 0 → `tsc --noEmit` → `npm audit \|\| true` → bundle-check), `build` (+artifact `dist/`), `test` (`vitest run`), `deno-contract-tests` | o mais útil; morre no `npm ci`. `npm audit` neutralizado por `\|\| true` (`:33`) |
| `lint.yml` | `Lint` | push `main`/`develop`, PR `main` | `npm run lint` + `format:check` + `type-check` | roda justamente o `npm run lint` que o `ci.yml:24-25` abandonou por causa do `--ext`. É o **único** lugar que checa Prettier |
| `deploy.yml` | `Deploy` | push `main` + dispatch | Vercel `--prod` via `amondnet/vercel-action@v25` | secrets inexistentes; sem gate de CI |
| `cd.yml` | *(sem `name:`)* | tag `v*` | build + `aws s3 sync dist/` + invalidação CloudFront (`us-east-1` hardcoded) | secrets inexistentes |
| `release.yml` | `Release` | tag `v*` — **idêntico ao `cd.yml`** | GitHub Release com `dist/*` | sem `permissions: contents: write` |
| `preview.yml` | `Preview` | PR opened/synchronize | build e… `echo "Preview deployment would happen here"` (`:17-18`) | **placeholder**; só queima runner |
| `desktop-build.yml` | `Desktop Build` | push em `desktop-agent/**` | matriz macOS/Windows/Ubuntu: `npm ci` + `npm run build` | **quebrado**: `desktop-agent/` não tem lockfile (`npm ci` exige um) e o build é `electron-builder --win`, rodado nos 3 OS |
| `mobile-build.yml` | `Mobile Build` | push em `mobile-app/**` | Expo export | **morto**: `mobile-app/` não existe no repo |
| `performance.yml` | `Performance` | push `main` | Lighthouse CI contra `https://sentinela.app` (hardcoded) | mede produção, não o commit; sem budgets, não reprova nada |
| `security-scan.yml` | `Security Scan` | push `main` + cron diário `0 0 * * *` | CodeQL v3, **sem input `languages:`** | falha: configuration error |
| `security.yml` | `Security Scan` *(nome duplicado)* | push `main` + cron domingo `0 0 * * 0` | `npm audit` bloqueante + Snyk (`@master`) + CodeQL **v2** (`languages: javascript`) | dois workflows com o mesmo `name:` na aba Actions; sem `setup-node`/`npm ci` antes do Snyk |
| `update-deps.yml` | `Update Dependencies` | cron domingo + dispatch | `npm update` + `npm audit fix` + PR `deps/weekly-update` | redundante com Dependabot **e** Renovate; sem validação antes de abrir PR |

**Atualização de dependências está quadruplicada:** `.github/dependabot.yml` (npm semanal segunda, 5
grupos — `lint`, `test`, `react`, `i18n`, `types` — + github-actions), `renovate.json` (agrupa **tudo**
num PR só, automerge de minor/patch), `update-deps.yml` e `scripts/update-deps.sh`. **Só o Dependabot
tem evidência de uso**: os 12 commits mais recentes da `main` são merges dele. Os 10 PRs abertos de
dependência também são dele.

**Varredura de segurança triplicada e divergente:** CodeQL roda em v3 (`security-scan.yml`) e v2
(`security.yml`) sobre o mesmo repo, e `npm audit` aparece 3 vezes, uma delas desarmada com `|| true`.

**Não existe no CI:** E2E (Playwright não é invocado por nenhum workflow, apesar de `playwright.config.ts`
e `e2e/auth.spec.ts` existirem), cobertura (`codecov.yml` existe mas nenhum job gera/sobe coverage),
benchmarks, validação de mensagem de commit/título de PR, e nenhum guard que rode `scripts/` ou `make`.

## `.github/` — o resto

- **`CODEOWNERS`** (22 linhas) é o que vale; `* @adm01-debug` na linha 2 já cobre tudo e as 8 regras
  por diretório são decorativas. **`CODEOWNERS_v15` é ignorado pelo GitHub** (nome não reconhecido) —
  resquício versionado.
- **Dois templates de PR, byte-idênticos:** `.github/PULL_REQUEST_TEMPLATE.md` e
  `.github/pull_request_template.md` (mesmo md5). O GitHub resolve para um; o outro fica inerte.
- `ISSUE_TEMPLATE/bug_report.md` e `feature_request.md`; `FUNDING.yml` → `github: [adm01-debug]`.
- 11 issues abertas no repo.

## PRs abertas — conferir antes de começar

Regra: PR aberta tocando os mesmos arquivos → **pare e avise o dono**. Hoje há 11 abertas: 10 do
Dependabot (todas só `package.json` + `package-lock.json`) e a **#88
(`claude/chore-agents-texto-mestre-261102-1040`, de 2026-11-02), que toca `AGENTS.md` e `CLAUDE.md`** —
ela implementa o padrão **anterior** ("texto-mestre, seções 1–7") e foi superada por este. Não
trabalhe nela nem mergeie as duas.

## Antes de abrir PR

- `npx eslint <arquivos que você tocou>` e `npx vitest run <caminho>` — só o que você tocou.
- `node scripts/ci/check-claude-md-integrity.mjs` se mexer em `AGENTS.md`, `CLAUDE.md` ou
  `docs/agentes/*.md`: exige os 8 cabeçalhos do `AGENTS.md` e barra o conjunto encolher mais de 30%
  (ou qualquer arquivo vigiado encolher mais de 50%).
- Erro de typecheck/lint **herdado da `main`** (356 erros de `tsc`, eslint abortando) não é seu: vai
  para "Próximos passos", não para o diff.
