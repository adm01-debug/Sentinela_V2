# `inventario/estado/` — estado real medido, não documentação

Arquivos gerados por script a partir do código/banco. Leia-os **antes** de abrir PR ou procurar
no repositório: eles respondem "o que existe hoje" sem custo de busca.

| arquivo | gerador | o que contém | regerar |
|---|---|---|---|
| `edges.json` | `scripts/inventario/gerar-repo.mjs` | As 85+ edge functions: linhas, segredos lidos (`Deno.env.get`) e quantos chamadores há em `src/`, migrations, outras edges, e2e e CI; `sem_chamador` marca as órfãs | `node scripts/inventario/gerar-repo.mjs < /dev/null` |

Atualização automática: `.github/workflows/inventario-estado-semanal.yml` (segunda 10:31 UTC) regenera e
abre PR em `automation/inventario-estado` **só quando o conteúdo muda de verdade** —
`scripts/inventario/mudou-conteudo.mjs` ignora os carimbos de data (`gerado_em`, `medido_em`).

Nunca edite estes arquivos à mão: o próximo run sobrescreve.

Falta portar do Zapp Web V2 (ver `docs/agentes/scripts-autonomos.md`): `banco.json` (tabelas, RLS,
policies, triggers, cron, órfãs — exige `SUPABASE_ACCESS_TOKEN`) e `rotas.json` (URLs × telas × menu ×
papéis × hooks × tabelas, precisa de adaptação à arquitetura de rotas deste repo).
