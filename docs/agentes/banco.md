# Banco de dados — referência para agentes

Ler **antes** de rodar SQL, criar/aplicar migration, mexer em RLS ou fazer deploy de edge function.
Resumo das regras no `AGENTS.md`; aqui está o detalhe. Neste repo errar o banco é fácil: existem
**três project refs diferentes** no código, e o que o CLI usa por padrão **não é o de produção**.

## Os três refs — qual é qual

| Ref | Onde está | O que é |
|---|---|---|
| **`jgnmwvzephsozsqmcpzb`** | `supabase/.temp/linked-project.json:1` (`"name":"Sentinela - V2"`); 29 ocorrências em `seed/*.cjs`, `smoke_*.cjs`, `test_*.cjs`, `schema2.cjs`, `temp_schema.ps1`, `MIGRATION_PLAN_FOR_CLAUDE_WEB.md:6` | **Produção. É este o banco do projeto.** É o projeto linkado pelo CLI e o alvo de todo script de seed/smoke do repo. |
| `ybvdtjpyolbnjirjrthe` | `supabase/config.toml:1` (`project_id`) | **NÃO é produção.** Ref legado da era Lovable. É o default do Supabase CLI: `supabase db push` / `supabase functions deploy` **sem `--project-ref` explícito aponta para cá**. Nunca escrever. |
| `rmiznlzpbwqpbzaiyydw` | `desktop-agent/src/config.ts:3` (`API_URL`, literal, sem fallback de env) | **NÃO é produção.** O agente desktop chama edge functions de um terceiro projeto. Nunca escrever. |

Nenhum dos três está em `.env.example`, `.env.local.example` ou `.env.production.example` — esses
arquivos não trazem URL real. Consequência prática: **sempre passe `--project-ref jgnmwvzephsozsqmcpzb`**
em qualquer comando do CLI, ou corrija o `config.toml` antes (mudança de perímetro → chame o dono).

## Onde se trabalha

| Situação | Banco | Como |
|---|---|---|
| Diagnóstico | **produção, só leitura** | `SELECT` por MCP/Management API; nunca escrita para "testar" |
| Migration nova | arquivo em `supabase/migrations/` | PR → merge → apply (abaixo). Hoje **nenhum workflow aplica DDL** |
| Teste de comportamento de banco | **Postgres descartável** | nunca no banco de produção |
| DDL destrutivo, segredos, rotação de chaves | **só com o dono** | — |

O front não tem desvio para banco local: `src/integrations/supabase/client.ts:5-6` lê
`VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` e, se faltarem, **não quebra** — só
`console.error` (`:8-14`) e cai em `https://placeholder.supabase.co` / `placeholder-anon-key`
(`:20-21`). Tela branca não acontece; o que acontece é todo request falhando contra um host fake.
Antes de testar tela, confira que as duas variáveis estão no `.env.local`.

**Descasamento de nome de variável:** `.env.local.example:3` define `VITE_SUPABASE_ANON_KEY`, mas o
código lê `VITE_SUPABASE_PUBLISHABLE_KEY`. Seguir o exemplo ao pé da letra produz client com chave
placeholder. `.env.example` descreve um backend diferente (Postgres próprio + Redis,
`DATABASE_URL`/`REDIS_URL`, e `SUPABASE_*` **sem** prefixo `VITE_`, que o Vite nunca expõe).

## Estrutura

```
supabase/
├── config.toml                  4 linhas: project_id (errado) + [functions.migrate-helper] verify_jwt=false
├── .temp/linked-project.json    COMITADO (não está no .gitignore) — é onde está o ref de produção
├── migrations/                  102 arquivos .sql, tudo plano, sem pasta de arquivo morto
└── functions/                   85 funções + _shared/ (cors, auth, logger, rateLimiting, schemas, validation, halfSpaceTrees)
```

- 95 das 102 migrations seguem o padrão Lovable `<timestamp14>_<uuid>.sql`; 7 têm nome descritivo, e
  duas delas (`20260102_activity_logs.sql`, `20260102_crud_improvements.sql`) têm timestamp de 8
  dígitos — **ordenação ambígua**, não copie esse padrão.
- `config.toml` **não** configura auth, db, storage, realtime, portas locais nem `verify_jwt` das
  outras 84 funções.
- Tipos gerados: `src/integrations/supabase/types.ts` (6.368 linhas, `PostgrestVersion: "14.5"`),
  consumido em `client.ts:3,19`. Augment manual em `src/types/supabase-augment.d.ts`.
  **Não existe script de regeneração** (`supabase gen` não aparece em nenhum lugar do repo) e nenhum
  workflow confere drift de tipos — regenerar é manual.

## Como o DDL entra em produção

**Não há caminho automatizado nem aprovação humana.** Nenhum dos 12 workflows em
`.github/workflows/` toca no banco. O que existe:

- `scripts/migrate.sh:4` → `npx supabase migration up`
- `scripts/seed.sh:4` → `npx supabase db push` (**o script chamado "seed" é o que aplica DDL**)
- `Makefile` tem `db-migrate`/`db-seed`/`db-reset`, que chamam scripts npm **inexistentes** — alvos quebrados
- MCP / Management API (`api.supabase.com/v1/projects/<ref>/database/query`), que é o caminho real
  usado nas sessões anteriores (`MIGRATION_PLAN_FOR_CLAUDE_WEB.md:7`)

Regras que valem mesmo assim:

1. **Ordem obrigatória: arquivo em `supabase/migrations/` → PR → merge em `main` → apply.** Nunca DDL
   a partir de branch aberta.
2. `REVOKE`, `DROP`, rename ou mudança de contrato de função usada pelo front/edges: **nunca** antes
   do deploy do código correspondente.
3. Sempre `--project-ref jgnmwvzephsozsqmcpzb` (ou corrija o `config.toml` primeiro).
4. `CREATE INDEX CONCURRENTLY` e `VACUUM` não rodam por gateway que envolve em transação — use
   `CREATE INDEX` simples.
5. Antes de criar arquivo de migration: confira o maior timestamp em `ls supabase/migrations | tail`
   **e** as PRs abertas que toquem `supabase/migrations/`.

### O ledger não existe — leia isto antes de confiar nas migrations

`ESTADO_ATUAL.md:263-264` (§5.3) registra, já verificado contra o banco: a tabela
`supabase_migrations.schema_migrations` **não existe** em produção; as 102 migrations **não são
rastreadas**; um `supabase db reset` a partir deste repo produziria um banco **diferente** do de
produção, nos dois sentidos. Drift medido ali: 6 funções do repo ausentes do banco, 2 funções vivas
sem migration, 1 tabela declarada e ausente (`entity_versions`, usada 3× no front) e **9 tabelas
vivas sem migration** — `achievements`, `departments`, `employee_locations`,
`gamification_leaderboard`, `geo_blocking_settings`, `geo_blocks`, `geofence_events`,
`geofence_states`, `policy_acknowledgments`.

Portanto: **o banco ao vivo é a verdade**; o repo é uma aproximação. Confirme estrutura por
`pg_get_functiondef` / `pg_indexes` / `information_schema`, nunca por leitura de migration.

## RLS

Nas migrations: **364 `CREATE POLICY`** e **121 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`** (há
repetições). Convenção consistente: habilita RLS e cria policy na mesma migration.

Lacunas já medidas — não são hipótese:

- `ESTADO_ATUAL.md:296-299` (§5.6): `achievements`, `departments`, `gamification_leaderboard` com
  `relrowsecurity = false`, contra 151 tabelas com RLS ativo. As três estão entre as 9 criadas fora
  de migration.
- `MIGRATION_PLAN_FOR_CLAUDE_WEB.md:30-32`: `audit_logs` com RLS habilitado e **zero policies** →
  acesso totalmente bloqueado. `:35-37`: partição `click_logs_partitioned_2026_12` sem policy.
  `:43-56`: INSERT policy faltando em `file_transfers`, `dlp_redaction_log`, `siem_delivery_log`,
  `siem_event_outbox`.
- `sql/create_missing_rpcs.sql:55-58` concede `EXECUTE` de `has_role` também ao papel `anon`.

Mexeu em RLS de uma tabela → confira a tabela ao vivo (`relrowsecurity` + `pg_policies`), não a migration.

## Edge functions

85 funções. CORS centralizado existe (`supabase/functions/_shared/cors.ts:1-12`, `Allow-Origin: '*'`)
mas **só 2 das 85 o importam**; 72 declaram `Access-Control-Allow-Origin` inline. Ao criar função
nova, use `_shared/cors.ts`.

Duas funções exigem atenção antes de qualquer deploy:

- **`migrate-helper`** (`supabase/functions/migrate-helper/index.ts`): o próprio comentário `:1-3` diz
  que é temporária e deve ser removida. Está com `verify_jwt = false` (`supabase/config.toml:3-4`),
  autentica por **chave estática escrita no repo** (`:5`) e a action `credentials` (`:24-30`)
  **devolve em JSON** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_DB_URL`. Se estiver
  publicada, qualquer um com o repo exfiltra a service role e a string de conexão.
  Se está publicada em `jgnmwvzephsozsqmcpzb`: **NÃO VERIFICADO** (não há MCP deste projeto na sessão).
- **`external-db-bridge`** (`index.ts:1-4,14-25`): proxy genérico com `action` `query|insert|update|delete|rpc`
  e `table`/`rpc_name` arbitrários.

Funções invocadas pelo front que **não existem** em `supabase/functions/`:
`sync-whatsapp-templates` e `award-gamification-points` (`ESTADO_ATUAL.md:285-291`, §5.5).

## Serviços externos que o banco toca — não escrever neles

1. **Lovable Cloud (auth de terceiro):** `@lovable.dev/cloud-auth-js` em `package.json`,
   `src/integrations/lovable/index.ts:1-15`, usado no OAuth Google em `src/pages/Auth.tsx:13,419`.
2. **Lovable AI:** `supabase/functions/ocr-screenshot/index.ts:27` chama `api.lovable.dev`, com
   `LOVABLE_API_KEY` (`:67,118,176-177`). `docs/FUNCIONALIDADES_COMPLETAS.md:158` afirma "sem API key
   necessária" — está errado.
3. **`https://lovable.dev` como fallback de reset de senha:**
   `supabase/functions/send-password-reset/index.ts:48` usa `SITE_URL` ou, sem ela, o domínio de
   terceiro. Confira `SITE_URL` antes de mexer em reset.
4. **Postgres self-hosted:** `docs/SELF_HOSTING.md`, `scripts/init-db.sh`, `scripts/restore.sh`
   operam em `DATABASE_URL` via `psql` — backend paralelo, não é o Supabase do projeto
   (e o `schema.sql` que o doc manda aplicar não existe no repo).
5. **SIEM externo:** `siem_connectors`, `siem_event_outbox`, `siem_delivery_log`.
6. MCPs rotulados "GESTÃO DE CLIENTES" / "GESTÃO DE PRODUTOS" na sessão **não são deste projeto** —
   escrever por eles atinge bancos de outros produtos.

## Segredos comitados — tratar como vazados

Rastreados pelo git hoje (valores não reproduzidos aqui):

| Tipo | Onde |
|---|---|
| PAT de Management API (`sbp_…`) | `schema2.cjs:2`, `seed/probe_emp_status.cjs:3` |
| JWT do projeto (anon e service_role) | 22 arquivos: `smoke-test.cjs`, `smoke_*.cjs` (6), `test_auth.cjs`, `test_severity.cjs`, `debug_fail.cjs`, `temp_schema.ps1`, `seed/*.cjs` (9+) |
| Chave estática de acesso | `supabase/functions/migrate-helper/index.ts:5` |
| Ref + `organization_id` do projeto | `supabase/.temp/linked-project.json:1` |

Regra: segredo novo **nunca** em código, commit ou resposta — só em env/secret do serviço
(`supabase secrets set` ou painel). Achou segredo em commit → reporte `arquivo:linha` + tipo, nunca o
valor, e trate rotação com o dono.
