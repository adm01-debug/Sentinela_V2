# Deploy e infraestrutura — referência para agentes

Ler quando for confirmar um deploy, mexer em env vars, domínio, Docker, Kubernetes ou monitoramento.

**Resumo honesto:** o repo versiona **três arquiteturas de deploy mutuamente exclusivas** e nenhuma
delas está comprovadamente funcionando por pipeline. O único caminho com action real disparando em
`main` é a Vercel — e os secrets que ela precisa **não existem no repo**
(`docs/agentes/github-ci.md`). Antes de prometer deploy, leia esta página inteira.

## Vercel (o caminho real do front)

| O que | Valor |
|---|---|
| Projeto | `sentinela-v2` (ID `prj_…`: Vercel → Settings → General, ou `mcp__Vercel__list_projects`) |
| Team | `juca1` (ID `team_…`: Vercel → Team Settings, ou `mcp__Vercel__list_teams`) |
| URL | `https://sentinela-v2.vercel.app` (é a `homepage` registrada no GitHub) |
| Framework / build / output | Vite + React 19 · `npm run build` · `dist/` |
| `vercel.json` | **não existe no repo** — toda a configuração de build/rotas/headers está só no dashboard |
| MCP Vercel | `mcp__Vercel__*` — escrita = ação de produção |

- O workflow `deploy.yml` roda `amondnet/vercel-action@v25` com `--prod` em **todo push para `main`**,
  sem depender do CI. Mas usa `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`, que **não estão
  cadastrados** (nem no repo nem nos 3 environments).
- Se o deploy vem da integração nativa Git↔Vercel (e não do workflow): **NÃO VERIFICADO** — o token
  da sessão recebe `403` em `list_deployments` e `404` em `get_project`. Confirme no dashboard antes
  de afirmar que um merge subiu.
- **Nunca** coloque segredo de servidor na Vercel (`SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `SMTP_*`,
  `AWS_*`): não há serverless neste projeto. Toda var `VITE_*` entra no bundle e **é pública**.

## Variáveis de ambiente — os três `.env*.example` discordam entre si e do código

O código lê (medido em `src/`): `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`
(`src/integrations/supabase/client.ts:5-6`), `VITE_API_URL` (2 usos), `VITE_SENTRY_DSN`,
`VITE_VAPID_PUBLIC_KEY`.

| Arquivo | O que traz | Problema |
|---|---|---|
| `.env.local.example` | `VITE_SUPABASE_URL=http://localhost:54321`, **`VITE_SUPABASE_ANON_KEY`**, `VITE_API_URL=http://localhost:3000`, flags | o nome da chave está errado: o código lê `VITE_SUPABASE_PUBLISHABLE_KEY`. Seguindo este arquivo, o client sobe com chave placeholder |
| `.env.production.example` | `VITE_API_URL=https://api.sentinela.app`, `VITE_APP_NAME`, `VITE_SENTRY_DSN` | não traz nenhuma var do Supabase |
| `.env.example` | `DATABASE_URL`, `REDIS_URL`, `SUPABASE_URL`/`ANON_KEY`/`SERVICE_KEY` (**sem** `VITE_`), `JWT_SECRET`, `SESSION_SECRET`, `SMTP_*`, `S3_*`, `AWS_*`, `PORT` | descreve um backend que **não existe neste repo**. Sem prefixo `VITE_`, o Vite não expõe nada disso ao front. `scripts/setup.sh:5` copia este arquivo para `.env.local` — o setup não produz ambiente funcional |

Para rodar local: `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` apontando
para o projeto de produção (`docs/agentes/banco.md`) — **ciente de que o dev server fala com
produção**, porque não há desvio para banco local no client.

## Domínios — quatro variações, nenhuma consolidada

- `sentinela-v2.vercel.app` — homepage do repo (o que existe de fato)
- `sentinela.app` — `performance.yml:13` (Lighthouse), `k8s/ingress.yaml:15`, `helm/values.yaml:12`
- `app.sentinela.com` — segundo Ingress, embutido em `k8s/service.yaml:27`
- `api.sentinela.com` (`k8s/configmap.yaml:6`) × `api.sentinela.app` (`.env.production.example:2`)

O Lighthouse mede um domínio que pode não ser o do projeto; o resultado não reprova PR (sem budgets,
sem `lighthouserc.*`).

## Docker — quebrado

- **`Dockerfile` é de um projeto Next.js**: `:15,22` `ENV NEXT_TELEMETRY_DISABLED`, `:25` cria user
  `nextjs`, `:28-29` copia `/app/.next/standalone` e `/app/.next/static`, `:34`
  `CMD ["node","server.js"]`. Este projeto é Vite/SPA e gera `dist/` — o build quebra no `COPY` do
  `.next/`. `:16 RUN npm run build` também precisaria de `bun` na imagem.
- `docker-compose.yml` usa esse Dockerfile e sobe redis 7 + postgres 15, serviços que **nenhum código
  do front usa** (o app fala com Supabase).
- `docker-compose.dev.yml:7` aponta para **`Dockerfile.dev`, que não existe**. É o arquivo que
  `scripts/docker-dev.sh:3` chama.
- `docker-compose.prod.yml` mapeia `80:80`, mas o Dockerfile expõe 3000.
- `nginx.conf` é uma config **correta** de SPA (`try_files … /index.html`), com proxy `/api` →
  `http://api:8080` para um serviço `api` que não existe em compose algum. **Nenhum Dockerfile copia
  este arquivo** — está órfão.
- **Nenhum workflow builda imagem Docker.**

## Kubernetes — aplicável só à mão, com defeitos

8 manifests em `k8s/`. A postura de segurança do `deployment.yaml:22-29` é boa
(`allowPrivilegeEscalation:false`, `readOnlyRootFilesystem:true`, `runAsNonRoot`, drop ALL). Os
defeitos:

- imagem `sentinela/web:latest` (`deployment.yaml:19`) que **nenhum pipeline builda ou publica**;
- probes `/health` e `/ready` (`:34-43`) que um SPA servido por nginx não responde;
- **Ingress duplicado**: `k8s/ingress.yaml` (host `sentinela.app`) e um segundo embutido em
  `k8s/service.yaml:14-37` (host `app.sentinela.com`), ambos com `secretName: sentinela-tls` e
  apontando para Services de nomes diferentes — e `sentinela-service` não existe;
- `pdb.yaml:9-11` seleciona `app: sentinela-web`, mas os pods têm label `app: sentinela`
  (`deployment.yaml:14-15`) → **o PDB não casa nenhum pod**;
- `deployment.yaml` e `service.yaml` **sem `namespace:`**, enquanto `hpa`/`ingress`/`pdb`/`secrets`
  usam `namespace: sentinela`.

Aplicado só por `scripts/deploy.sh:6` (`kubectl apply -f k8s/`), à mão.

## Helm e Terraform — esqueletos

- `helm/` tem `Chart.yaml`, 3 `values*.yaml` e **apenas `templates/_helpers.tpl`**: não há template de
  recurso nenhum, então `helm install` não cria nada. `Chart.yaml:6` diz `appVersion: "15.0.0"` contra
  `package.json:3` `17.0.0`.
- `terraform/main.tf:5-6` referencia `./modules/vpc` e `./modules/ecs` — **`terraform/modules/` não
  existe**, e a sintaxe de módulo em uma linha com `;` não é HCL válido. `terraform init` falha. Sem
  backend, sem outputs. Descreve ECS, enquanto `k8s/` descreve Kubernetes e `cd.yml` descreve
  S3/CloudFront: **três arquiteturas incompatíveis versionadas juntas**.

## Monitoramento — tudo declarado, nada ligado

| Arquivo | Estado |
|---|---|
| `monitoring/prometheus.yml` (job → `api:8080`) × `prometheus/prometheus.yml` (job → `localhost:3000`) | **duplicados e divergentes**; nenhum carrega `rule_files:` |
| `prometheus/alerts.yml` | 2 regras (`HighErrorRate`, `HighLatency`) que **nunca são lidas**; `HighLatency` sem `annotations` |
| `monitoring/alertmanager.yml` | receiver Slack `#alerts` **sem `slack_api_url`** → não envia |
| `monitoring/grafana-dashboard.json` × `grafana/dashboards/{main,performance}.json` | duplicados; sem `uid`/`schemaVersion`/`targets` — não são dashboards importáveis |
| `sentry.properties` (org `sentinela`, project `sentinela-web`) | nenhum workflow define `SENTRY_AUTH_TOKEN` nem sobe sourcemap. `@sentry/vite-plugin` está em `package.json` mas **não é usado em `vite.config.ts`** (plugins = só `react()`), apesar de `sourcemap: true` |
| `codecov.yml` (target 80%) | nenhum job gera coverage → o status nunca chega |
| `release.config.js` (semantic-release) | **nenhum workflow o roda**; usa `module.exports` em repo `"type": "module"`; nenhum plugin de semantic-release está instalado; e `package.json` **não tem `"private": true`** — se alguém rodar, o plugin npm tenta publicar o pacote |

## Regras

1. Merge em `main` **pode** ser produção (a Vercel está ligada ao repo). Depois do merge, confira o
   deploy e reporte; se não conseguir confirmar, diga "não verificado", não "deveria funcionar".
2. Não mexa em `Dockerfile`, compose, `k8s/`, `helm/`, `terraform/`, workflows ou secrets sem chamar o
   dono — é item de "deixe a PR aberta" no fluxo Git.
3. Não "conserte" infraestrutura que não foi pedida, mesmo quebrada. Registre em "Próximos passos".
