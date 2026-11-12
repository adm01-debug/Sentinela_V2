# `scripts/inventario/` — geradores do estado real

Saída versionada em `inventario/estado/` (ver o README de lá). Zero dependências, Node ≥ 18.

| script | o que faz | uso |
|---|---|---|
| `gerar-repo.mjs` | Lê `supabase/functions/` e conta chamadores de cada edge em `src/`, migrations, outras edges, `e2e/` e CI (precisa de `rg`/ripgrep) | `node scripts/inventario/gerar-repo.mjs < /dev/null` → `inventario/estado/edges.json` |
| `mudou-conteudo.mjs` | Compara o arquivo gerado com a versão do HEAD ignorando carimbos (`gerado_em`, `medido_em`); imprime `true`/`false` | `node scripts/inventario/mudou-conteudo.mjs inventario/estado/edges.json` |

Acionados por `.github/workflows/inventario-estado-semanal.yml`. Portados de `adm01-debug/Zapp_Web_V2`;
o que ainda falta está em `docs/agentes/scripts-autonomos.md`.
