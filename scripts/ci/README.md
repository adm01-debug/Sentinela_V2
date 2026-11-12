# `scripts/ci/` — gates incrementais

Portado de `adm01-debug/Zapp_Web_V2`. Baseline captura a dívida de HOJE; o ratchet falha só
se surgir ocorrência **nova** — permite destravar CI sem corrigir tudo de uma vez.

| script                          | o que congela                                                                  | baseline                                                |
| ------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `lint-ratchet.mjs`              | ESLint (`eslint . --format json`)                                              | `eslint-baseline.json` (1633 ocorrências, 08/11/2026)   |
| `typecheck-ratchet.mjs`         | `tsc -b --force` (`tsc --noEmit` sozinho é no-op nesta config de `references`) | `typecheck-baseline.json` (307 ocorrências, 08/11/2026) |
| `check-claude-md-integrity.mjs` | integridade do AGENTS.md/CLAUDE.md/docs/agentes                                | — (git, sem baseline)                                   |

Uso:

```sh
node scripts/ci/lint-ratchet.mjs            # falha só com ocorrência nova
node scripts/ci/lint-ratchet.mjs --staged   # só os arquivos do commit (pre-commit)
node scripts/ci/typecheck-ratchet.mjs

# atualizar baseline só com aprovação explícita, depois de revisar toda a diferença:
node scripts/ci/lint-ratchet.mjs --update-baseline
node scripts/ci/typecheck-ratchet.mjs --update-baseline
git diff -- scripts/ci/eslint-baseline.json scripts/ci/typecheck-baseline.json
```

**Achado aberto, fora do escopo deste port:** `eslint.config.js` aplica `js.configs.recommended`
num bloco sem `files:` (ao contrário do Zapp, que escopa via `tseslint.config()`), então arquivos
`.mjs`/`.cjs` caem sem `globals.node` e `console`/`process` disparam `no-undef`. Pré-existente —
97 dessas ocorrências já estavam na primeira geração da baseline, vindas dos scripts da Fase 1
(`scripts/ai-context/`, `scripts/inventario/`). O ratchet aceita isso como dívida já conhecida;
corrigir o `eslint.config.js` para dar `globals.node` a `scripts/**/*.{mjs,cjs}` é item separado.
