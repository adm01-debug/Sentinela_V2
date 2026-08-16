# ESTADO ATUAL DO SISTEMA — SENTINELA V2

> **Auditoria de estado medida, não herdada.** Data: 16/08/2026.
> Método: Fase A (reconhecimento) → Fase B (simulação de falhas) → Fase C (inventário) →
> Fase D (verificação independente) → Fase E (runtime).
> Toda linha classificada cita `arquivo:linha`, objeto de banco ou identificador de execução.
> Onde não houve prova verificável, a linha caiu para 🟦 — nunca subiu.

---

## 1. VEREDITO EM UMA TELA

O Sentinela é uma **plataforma grande e real** — 126.163 linhas de front-end, 84 Edge Functions,
105 tabelas lógicas, 388 políticas RLS — cujo **fio de execução está rompido em três pontos
estruturais**, todos verificados em runtime:

1. **O CI está 100% vermelho há 5 dias e nunca executou a suíte de testes.** As últimas 30
   execuções do GitHub Actions falharam — sem exceção. A causa é um conflito de peer dependency
   que mata o `npm ci` em 1 segundo, fazendo lint, type-check, build e testes serem **pulados**.
   O badge "1.888 testes / 100% coverage" do README nunca foi validado por pipeline.
2. **O dashboard principal exibe dados fictícios hardcoded.** Os dois gráficos da tela inicial
   são alimentados por constantes literais, sem qualquer caminho para dados reais. Alertas e
   atividades caem para nomes inventados ("Carlos Silva", "Ana Costa") sempre que as tabelas
   estão vazias — que é o estado atual.
3. **O ambiente não nasce do repositório.** Não existe `supabase_migrations.schema_migrations`
   no banco: as 102 migrations versionadas não são rastreadas. Seis funções declaradas no repo
   não existem no banco; duas funções vivas não estão em migration nenhuma.

Além disso, **o sistema está dormente**: a última escrita em qualquer tabela de negócio foi em
**11/08/2026** — 5 dias atrás. 55 das 105 tabelas lógicas (52%) estão vazias, incluindo as que
sustentam DLP, UEBA, screenshots, gravações, webhooks e SIEM.

**O que está genuinamente bom:** a camada de integração Slack/WhatsApp é a mais madura do
sistema — tem DLQ, replay, monitor de MTTR e **tráfego real medido** (504 eventos de entrega,
483 mensagens). A modelagem de dados é séria (RLS em 151 de 154 tabelas, particionamento mensal
provisionado até 2026-12). O agente desktop tem serviços reais, não esqueletos.

| Classificação | Qtd | % |
|---|---:|---:|
| ✅ IMPLEMENTADO_TOTAL | 23 | 21,5% |
| 🟨 IMPLEMENTADO_PARCIAL | 38 | 35,5% |
| 🟦 SUGERIDO_OU_INICIADO | 37 | 34,6% |
| ⬛ MORTO_OU_ABANDONADO | 9 | 8,4% |
| **Total de linhas de inventário classificadas (§6)** | **107** | **100%** |

**Denominador declarado:** os 107 são as **linhas das tabelas de inventário da §6** — recontadas
por script sobre este próprio arquivo, não estimadas. Duas ressalvas de leitura, para que ninguém
use o número como se fosse outra coisa:
- A §6.3 comprime **84 Edge Functions em 4 linhas** (agrupadas por situação). Expandidas uma a uma,
  o total sobe para 144 linhas e o ⬛ salta de 9 (8,4%) para **46 (31,9%)** — o retrato fica bem
  mais duro, e igualmente verdadeiro.
- A §7 (roadmap planejado, 28 itens) **não entra nesta contagem**: são itens que ainda não são
  código, e somá-los inflaria artificialmente o 🟦.

---

## 2. COMO LER ESTE DOCUMENTO

| Classificação | Significado | Prova exigida |
|---|---|---|
| ✅ **IMPLEMENTADO_TOTAL** | UI → lógica → persistência → **em uso real** | caminho:linha de cada camada + objeto de banco + evidência de uso |
| 🟨 **IMPLEMENTADO_PARCIAL** | Existe e funciona em parte: falta camada, tabela vazia, fio quebrado | caminho:linha + exatamente o que falta |
| 🟦 **SUGERIDO_OU_INICIADO** | Só menção, planejamento, esqueleto sem lógica | caminho:linha do que existe + por que não funciona |
| ⬛ **MORTO_OU_ABANDONADO** | Código presente, nenhum caminho de execução chega nele | caminho:linha + prova de ausência de chamador |

**Regra de ouro aplicada:** *pronto = em produção com uso real.* Feature que existe em código e
nunca foi executada por um usuário é 🟨, não ✅.

Marcações de runtime: `VERIFICADO` (consultado no banco/API de produção em 16/08/2026) ou
`NAO_VERIFICADO` (sem acesso — declarado, nunca simulado).

---

## 3. FASE A — RECONHECIMENTO (medição, não estimativa)

### 3.1 Dimensão do código

| Escopo | Arquivos | Linhas |
|---|---:|---:|
| `src/` (TS + TSX) | 1.257 | 126.163 |
| ├─ `src/components/` | 388 | 44.102 |
| ├─ `src/hooks/` | 479 | 31.321 |
| ├─ `src/pages/` | 104 | 16.454 |
| ├─ `src/test/` | 45 | 9.460 |
| ├─ `src/integrations/` (tipos Supabase gerados) | 4 | 6.436 |
| ├─ `src/types/` | 58 | 5.708 |
| ├─ `src/utils/` | 64 | 5.170 |
| ├─ `src/lib/` | 42 | 2.866 |
| ├─ `src/stores/` | 34 | 2.513 |
| └─ demais (`services`, `providers`, `routes`, `guards`, `i18n`…) | 39 | 2.133 |
| `supabase/functions/` (84 funções + `_shared`) | — | 11.562 |
| `supabase/migrations/` | 102 | 6.412 |
| `desktop-agent/` | 23 | 2.349 |

### 3.2 Stack

React 18 + TypeScript 5 + Vite 5 · TanStack Query · Tailwind + shadcn/ui · Zustand ·
Supabase (PostgreSQL 17.6, Auth, Storage, Edge Functions em Deno) · Vitest + Playwright ·
GitHub Actions (12 workflows) · Electron (`desktop-agent`) · Docker/Helm/Terraform/K8s presentes.

### 3.3 Inventários pré-existentes encontrados

A busca por `README* CHANGELOG* ESTADO* STATUS* FEATURE* INVENTAR* ROADMAP* AUDIT* docs/`
retornou **7 documentos que já se propõem a levantar estado**. Todos foram tratados como
**hipótese a testar**, e a seção 9 registra onde cada um diverge do medido:

`README.md` · `AUDITORIA_ENTERPRISE_SENTINELA.md` · `audit_report.md` · `VERSION.md` ·
`ROADMAP.md` + `docs/ROADMAP_2026.md` · `docs/FUNCIONALIDADES_COMPLETAS.md` ·
`docs/GAP_ANALYSIS_ENTERPRISE.md` · `.lovable/plan.md`

### 3.4 Coordenação com outros agentes

Branches remotas: apenas `main` e `claude/system-status-roadmap-5uycgm` (esta). Não há
arquivos de lane/tracking nem protocolo de coordenação declarado. Superfície desta auditoria:
**apenas o arquivo `ESTADO_ATUAL.md`** — nenhum outro artefato foi editado.

### 3.5 Acessos testados **antes** de prometer

| Acesso | Resultado |
|---|---|
| Banco de produção (MCP Supabase, leitura) | ✅ Funcionando — 22 MB, PostgreSQL 17.6 |
| GitHub Actions (conclusões reais dos checks) | ✅ Funcionando — 1.846 execuções históricas |
| Management API do Supabase (listar Edge Functions **deployadas**) | ❌ Indisponível (exige token `sbp_`) |
| Toolchain local (`node_modules`) | ❌ **Ausente** — e `npm ci` falha (ver §5.1) |

**Consequência declarada:** esta auditoria é **análise estática + runtime de banco/CI**.
Em nenhum momento se afirma que "os testes passam", que "compila" ou que uma Edge Function
específica está deployada — nada disso foi executado.

---

## 4. FASE B — SIMULAÇÃO DE FALHAS E INVARIANTES

| Cenário de falha | Mitigação aplicada |
|---|---|
| Escrever onde outro agente trabalha | Superfície única (`ESTADO_ATUAL.md`), branch própria, nenhum artefato de terceiros editado |
| Herdar afirmação de documento como fato | Todo doc pré-existente tratado como hipótese; §9 registra as divergências medidas |
| Afirmar leitura que não houve | Cada linha carrega `arquivo:linha` ou objeto de banco conferido nesta sessão |
| Critério de "código morto" com falso-negativo | Detector validado contra controles conhecidos e 4 achados reconferidos à mão (§8.2) |
| Estourar contexto em lote grande | Escopos acima do teto (migrations, `src/components`) auditados **por altitude** — inventário por objeto, não linha a linha |
| Tocar produção | **Zero DDL/DML.** Toda query de banco executada com `read_only: true` |

**Invariantes que abortariam o trabalho** (nenhuma foi violada): produção somente leitura;
nenhum artefato de outra trilha editado; nenhuma afirmação de execução não executada;
nenhuma célula de evidência sem verificação.

---

## 5. ACHADOS CRÍTICOS — ordenados por gravidade

### 5.1 🔴 CRÍTICO — CI 100% vermelho; testes e build nunca executam · `VERIFICADO`

**As últimas 30 execuções de workflow terminaram em `failure`.** Sem exceção — CI, Deploy,
Lint, Security Scan, Performance, Preview, CD, Desktop Build, Update Dependencies.

Cadeia exata, medida na execução **`31532420278`** (branch `main`, commit `10ad549f`, 11/08/2026):

| Job | Step | Conclusão |
|---|---|---|
| `quality` | `Run npm ci` | ❌ **failure** (20:20:40 → 20:20:41, 1 segundo) |
| `quality` | Lint / Type Check / Security Audit / Bundle Size Check | ⏭️ **skipped** (todos) |
| `build` | — | ⏭️ **skipped** (depende de `quality`) |
| `test` | — | ⏭️ **skipped** (depende de `quality`) |
| `deno-contract-tests` | `Run Contract Tests` | ❌ **failure** |

**Causa-raiz reproduzida localmente** (`npm ci --dry-run`, 16/08/2026):

```
Conflicting peer dependency: eslint@8.57.1
  peer eslint@"^7.0.0 || ^8.0.0" from @typescript-eslint/eslint-plugin@6.21.0
```

`package.json:106` declara `"eslint": "^10.7.0"` enquanto `package.json:102-103` mantêm
`@typescript-eslint/*` em `^6.20.0`, cujo peer aceita apenas eslint 7 ou 8. O `eslint` foi
promovido a v10 sem promover o `typescript-eslint` junto.

**Impacto:** nenhum gate de qualidade roda. O job `test` — o único que executaria os 1.174
blocos de teste do repositório — está pulado desde então. `Deploy` (Vercel) também falhou
no mesmo commit: **não há garantia de que o que está em produção corresponde ao `main`.**

### 5.2 🔴 CRÍTICO — Dashboard principal serve dados fictícios · `VERIFICADO`

Os dois gráficos da tela inicial recebem **constantes literais**, sem nenhum caminho alternativo
para dados reais:

- `src/pages/dashboard/dashboardData.ts:5-18` — `fallbackActivityData` (12 pontos horários fixos)
- `src/pages/dashboard/dashboardData.ts:20-27` — `fallbackProductivityData` (5 dias fixos)
- `src/pages/dashboard/DashboardCharts.tsx:34` e `:5` — `DashboardChartsRow` importa as constantes
  e as passa direto aos gráficos; **o componente recebe apenas `colors` como prop** — não há
  entrada de dados
- `src/pages/DashboardPage.tsx:198` e `:142` — o componente é renderizado na página principal

Alertas e atividades usam nomes de pessoas inventados como fallback:

- `src/pages/dashboard/dashboardData.ts:29-42` — `fallbackAlerts` / `fallbackActivities`
  ("Carlos Silva", "Ana Costa", "Pedro Santos", "Maria Oliveira", "João Lima")
- `src/pages/DashboardPage.tsx:72-73` — substituem os dados reais sempre que a consulta
  retorna vazio

**Por que isso importa agora:** as tabelas de origem estão vazias em produção
(`activity_logs` = 0, `productivity_logs` = 0 — contagem exata, 16/08/2026). Ou seja,
**o fallback é o que o usuário vê hoje**, não a exceção.

### 5.3 🔴 CRÍTICO — Ambiente não é reconstruível a partir do repositório · `VERIFICADO`

- `supabase_migrations.schema_migrations` **não existe** no banco. As 102 migrations em
  `supabase/migrations/` não são rastreadas — não há como saber quais foram aplicadas.
- **6 funções declaradas no repo, ausentes do banco:** `add_employee_points`,
  `audit_trigger_func`, `award_badge`, `check_permission`, `create_audit_log`,
  `create_entity_version`.
- **2 funções vivas no banco, ausentes de qualquer migration:** `get_geo_blocking_info`,
  `is_country_blocked` — foram criadas fora do versionamento.

Um `supabase db reset` a partir deste repositório produziria um banco **diferente** do de produção,
nos dois sentidos.

### 5.4 🟠 ALTO — Nenhum job agendado existe; a limpeza da DLQ nunca rodou · `VERIFICADO`

`supabase/migrations/20260723160921_*.sql:22` agenda `cleanup-slack-dlq-daily` **dentro de um
guard**: `IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')`.

Extensões instaladas no banco: `pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`,
`uuid-ossp`. **`pg_cron` não está instalado — e `pg_net` também não.**

O guard faz a migration passar em silêncio sem agendar nada. Resultado: `slack_notification_dlq`
acumula 61 itens sem expurgo, e **nenhuma das 38 Edge Functions de automação agendada
(`daily-summary`, `weekly-report`, `archive-data`, `expire-recordings`, `rotate-api-keys`,
`create-monthly-partitions`, `cleanup-sessions`…) tem gatilho algum.** Falham sem erro visível —
por isso nunca viraram chamado.

### 5.5 🟠 ALTO — Duas Edge Functions são chamadas pelo front e não existem no repositório · `VERIFICADO`

| Função invocada | Origem | Situação |
|---|---|---|
| `award-gamification-points` | `supabase.functions.invoke(...)` em `src/` | **ausente** de `supabase/functions/` |
| `sync-whatsapp-templates` | `supabase.functions.invoke(...)` em `src/` | **ausente** de `supabase/functions/` |

Não foi possível confirmar se existem *deployadas* (Management API indisponível — §3.5). Se não
existirem, ambas retornam erro ao usuário. **`NAO_VERIFICADO` quanto ao deploy.**

### 5.6 🟠 ALTO — Três tabelas sem RLS em sistema multi-tenant · `VERIFICADO`

`achievements`, `departments`, `gamification_leaderboard` estão com `relrowsecurity = false`
enquanto as outras 151 tabelas têm RLS ativo. `gamification_leaderboard` (7 registros) expõe
ranking nominal de funcionários sem isolamento por empresa.

### 5.7 🟡 MÉDIO — CI que mente: workflow morto e dois deploys concorrentes · `VERIFICADO`

- `.github/workflows/mobile-build.yml:3` dispara em `paths: ['mobile-app/**']`. **O diretório
  `mobile-app/` não existe no repositório** — o workflow nunca dispara, embora `docs/MOBILE_APP.md`
  documente um app móvel.
- **Dois pipelines de deploy para alvos diferentes:** `deploy.yml` publica na **Vercel** a cada
  push em `main`; `cd.yml` publica em **AWS S3 + CloudFront** a cada tag `v*`. Nada no repositório
  declara qual é o alvo de produção real.
- `ci.yml:34` executa `npm run bundle-check`, e `package.json:7` define `build` como
  `bun scripts/generate-audit-pdf.js && vite build` — **`bun` não é instalado por nenhum
  workflow**. Como o job `build` está pulado desde o quebra do `npm ci`, essa falha ainda não se
  manifestou. `NAO_VERIFICADO` (o job nunca chegou a rodar).

### 5.8 🟡 MÉDIO — Sistema dormente há 5 dias · `VERIFICADO`

Última escrita por tabela (16/08/2026):

| Tabela | Registros | Última escrita |
|---|---:|---|
| `edge_function_logs` | 390 | 2026-08-11 17:29 |
| `slack_delivery_events` | 504 | 2026-08-11 17:25 |
| `whatsapp_message_logs` | 483 | 2026-08-11 17:21 |
| `time_entries` | 42 | 2026-08-11 12:42 |
| `security_violations` | 15 | 2026-08-10 20:55 |
| `employees` | 8 | 2026-08-10 18:38 |

Último login em `auth.users`: **2026-08-11 17:50**. Total de usuários: **2**.
Objetos em Storage: **0** nos três buckets (`session-recordings`, `violation-screenshots`,
`acknowledgment-photos`) — apesar de `session_recordings` ter 6 registros de metadados.

---

## 6. INVENTÁRIO POR DIMENSÃO

### 6.1 Frontend e navegação

| Item | Classificação | Evidência |
|---|:---:|---|
| Roteamento central (54 rotas, lazy loading) | ✅ | `src/routes/AppRoutes.tsx` — 54 `path=`, 72 componentes referenciados |
| Guards de rota (auth / supervisor) | ✅ | `src/guards/` (69 linhas), aplicados em `AppRoutes.tsx` |
| Layouts e providers | ✅ | `src/layouts/` (2), `src/providers/` (9 arquivos, 509 linhas) |
| Biblioteca de componentes (shadcn/ui + próprios) | ✅ | `src/components/` — 388 arquivos, 44.102 linhas |
| i18n (pt-BR/en-US/es) | 🟨 | `src/i18n/` tem **1 arquivo, 48 linhas** — infra existe, cobertura de tradução não comprovada; `docs/I18N.md` promete 3 idiomas |
| Página `AlertRuleCreatePage` | ⬛ | `src/pages/AlertRuleCreatePage.tsx` — nome ausente de `AppRoutes.tsx` e `App.tsx`: sem rota |
| Página `Settings.tsx` (legado, coexiste com `SettingsPage.tsx`) | ⬛ | `src/pages/Settings.tsx` — sem rota; refactor abandonado |
| Componente `HeroMetrics` (sparklines com `Math.random()`) | ⬛ | `src/components/dashboard/HeroMetrics.tsx:224` — **zero consumidores** fora do próprio arquivo |
| Páginas de simulação/dev | 🟦 | `src/pages/dev/ChartSimulationPage.tsx`, `LiveViewSimulatorPage.tsx`, `VerifyReportSimulatorPage.tsx` — ferramentas de teste, não produto |

**Camada de hooks — achado estrutural:** de **475 hooks** em `src/hooks/*.ts(x)`,
**364 (77%) não têm nenhum consumidor** fora do próprio arquivo e de testes. Inclui utilitários
genéricos nunca usados (`useCounter`, `useToggle`, `useStopwatch`…) e hooks de negócio
(`useAIInsights`, `useProductivityComparison`, `useGamification`, `useViolations`,
`useAuditLogs`, `useDashboardPage`). Critério e verificação em §8.2.

### 6.2 Funcionalidades de negócio

#### Autenticação e acesso

| Funcionalidade | Classificação | Evidência |
|---|:---:|---|
| Login / registro / recuperação de senha | ✅ | `src/pages/Auth.tsx`, `ForgotPasswordPage.tsx`; `auth.users` = 2 usuários, último login 11/08/2026 |
| RBAC com permissões granulares | ✅ | RPCs vivas `has_permission`, `get_user_permissions`, `has_role`; tabelas `permissions` (32), `roles` (4), `user_roles` (3) |
| Rate limiting por IP | 🟨 | RPCs vivas `check_rate_limit`, `is_ip_blocked`, `ip_bypasses_rate_limit`; **`rate_limit_logs` = 0 registros** — nunca acionado |
| Bloqueio de IP / geobloqueio | 🟨 | RPCs `is_country_blocked`, `get_geo_blocking_info` vivas; `blocked_ips` = 0, `geo_blocks` = 0, `whitelisted_ips` = 0 |
| MFA | 🟨 | `src/components/MFASettings.tsx`; sem tabela de fatores populada — `NAO_VERIFICADO` no Auth do Supabase |
| WebAuthn / passkeys | 🟦 | `webauthn_credentials` = 0, `webauthn_challenges` = 0; função `cleanup_expired_webauthn_challenges` viva mas sem agendamento (§5.4) |
| Dispositivos conhecidos / device trust | 🟦 | `user_known_devices` = 0; `src/hooks/useDeviceTrust.ts` órfão |

#### Gestão de pessoas

| Funcionalidade | Classificação | Evidência |
|---|:---:|---|
| CRUD de funcionários | ✅ | `src/pages/EmployeesPage.tsx`, `EmployeeCreatePage.tsx`, `EmployeeDetailPage.tsx`; `employees` = 8 registros |
| Equipes e membros | ✅ | `src/pages/TeamsPage.tsx`, `TeamDetailPage.tsx`; `teams` = 7, `team_members` = 27 |
| Departamentos | 🟨 | `src/pages/DepartmentsPage.tsx`; `departments` = 7 — **porém sem RLS** (§5.6) |
| Organograma | 🟨 | `src/pages/OrgChartPage.tsx` roteada; sem tabela de hierarquia dedicada — deriva de `departments`/`teams` |
| Importação/exportação em massa de funcionários | 🟦 | Edge Functions `import-employees`, `process-bulk-import`, `merge-employees`, `sync-employee` — **nenhuma tem chamador** (§6.3) |
| Gamificação (ranking, conquistas) | 🟨 | `src/pages/GamificationPage.tsx` → `useGamificationPage.ts:18,27` lê `gamification_leaderboard` (7) e `achievements` (10); **`employee_points` = 0, `points_history` = 0, `badges` = 0, `employee_badges` = 0**; a função `award-gamification-points` invocada pelo front **não existe no repo** (§5.5) |

#### Monitoramento e captura

| Funcionalidade | Classificação | Evidência |
|---|:---:|---|
| Ingestão do agente desktop | 🟨 | Edge Function `agent-collector` + `validate-agent-key` invocadas pelo front; `agent_keys` = 4, `devices` = 6 — **mas `activity_logs` = 0, `keystroke_logs` = 0, `productivity_logs` = 0, `click_logs` = 0** |
| Ingestão mobile | 🟨 | Edge Function `mobile-collector` invocada; `mobile_devices` = 3, **`mobile_activity_logs` = 0** |
| Screenshots / capturas de tela | 🟦 | `src/pages/ScreenshotsPage.tsx` + `useScreenshots`; **`screen_captures` = 0 e bucket `violation-screenshots` com 0 objetos** |
| Gravação de sessão | 🟨 | `src/pages/admin/SessionRecordingsPage.tsx`, Edge Function `upload-recording-chunk`; `session_recordings` = 6 **metadados sem mídia** — `recording_chunks` = 0 e bucket `session-recordings` vazio |
| Live View (WebRTC) | 🟦 | `src/pages/LiveViewPage.tsx`, `useLiveViewSession.ts:101`, `webrtc-ice-config` invocada; **`live_view_sessions` = 0, `live_view_audit` = 0** — nunca usado |
| Status online/offline | 🟨 | `employee_status` = 6 registros; sem atualização desde 11/08 |
| Monitoramento de acesso à internet | 🟨 | `src/pages/InternetAccessPage.tsx`; `internet_access_settings` = 5, mas `station_block_logs` = 0 |

#### Segurança, violações e DLP

| Funcionalidade | Classificação | Evidência |
|---|:---:|---|
| Detecção e listagem de violações | ✅ | `src/services/violationService.ts`, `src/pages/ViolationsPage.tsx`, `ViolationDetailPage.tsx`; `security_violations` = 15 (última 10/08/2026) |
| Regras de aplicação (allow/block) | ✅ | `application_rules` = 15 registros; `src/hooks/useRules.ts` |
| Alerta de violação (notificação) | ✅ | Edge Function `process-violation-alert` invocada pelo front; efeito comprovado em `slack_delivery_events` (504) e `whatsapp_message_logs` (483) |
| Ações e comentários em violação | 🟦 | RPC `record_violation_action` viva; **`violation_actions` = 0, `violation_comments` = 0** |
| Disputas de violação + escalonamento SLA | 🟨 | `escalate-dispute-sla` e `notify-dispute-decision` existem; `src/pages/admin/DisputeMetricsPage.tsx`, `DisputeEscalationAuditPage.tsx`; trigger `sync_violation_dispute_status` viva; **`violation_disputes` = 0** — nunca exercitado |
| Regras de violação customizadas | 🟦 | **`violation_rules` = 0**; `useViolationRules.ts` e `useViolationRulesPage.ts` órfãos |
| Políticas DLP + classificadores BR | 🟨 | `src/pages/admin/DLPPoliciesPage.tsx`; `dlp_policies` = 3, `dlp_classifiers` = 12 — configurado, **mas `dlp_incidents` = 0** |
| Incidentes DLP | 🟦 | `src/pages/admin/DLPIncidentsPage.tsx:62` lê `dlp_incidents` — **tabela vazia**; `dlp-incident-report` e `dlp-policy-sync` existem |
| DLP clipboard no agente | 🟨 | `desktop-agent/src/services/dlp/clipboardDLP.ts`, `dlpEngine.ts`, `policySync.ts` — código real; sem incidente registrado que comprove execução |
| OCR de screenshot (DLP F2) | 🟦 | Edge Function `ocr-screenshot` existe e é invocada pelo front; **`dlp_redaction_log` = 0** e nenhum screenshot no bucket — sem execução comprovada |
| Document fingerprinting (DLP F3) | 🟦 | **`dlp_fingerprints` = 0**; sem Edge Function correspondente — apenas tabela provisionada |
| Rastreamento de transferência de arquivos | ✅ | `.lovable/plan.md` (plano) → `supabase/functions/ingest-file-transfer/`, `desktop-agent/src/services/fileTransferWatcher.ts`, `src/pages/admin/FileTransfersPage.tsx`; **`file_transfers` = 10 registros reais** (últ. 10/08/2026) |
| Bloqueio de USB / print screen | 🟨 | `desktop-agent/src/services/usbBlocker.ts`, `printScreenBlocker.ts`; sem telemetria que comprove acionamento |
| Geofencing | ✅ | `src/services/geofenceService.ts`, `src/pages/GeofencingPage.tsx`, `GeofenceViolationsPage.tsx`, Edge Function `check-geofence` invocada; `geofences` = 5, `employee_geofences` = 19, `geofence_violations` = 10 |
| Eventos/estados de geofence (histórico) | 🟦 | `geofence_events` = 0, `geofence_states` = 0 — o fluxo grava violação mas não a trilha |
| Log de auditoria | 🟨 | `src/pages/AuditLogPage.tsx`; RPC `log_activity` viva e `settings_audit_log` = 10 registros, **mas `audit_logs` = 0** — a página aponta para a tabela vazia |
| Políticas de segurança + aceite | 🟨 | `security_policies` = 8, Edge Function `get-policies`; **`policy_acknowledgments` = 0, `policy_exemptions` = 0**; `src/pages/admin/AcknowledgmentReportPage.tsx` sem dados |
| Imutabilidade de audit log (hash chain) | 🟦 | Planejado em `docs/ROADMAP_2026.md` (Q3) — nenhuma tabela ou função correspondente |

#### Ponto, jornada e produtividade

| Funcionalidade | Classificação | Evidência |
|---|:---:|---|
| Registro de ponto | ✅ | `src/pages/TimeClockPage.tsx`, `AttendancePage.tsx`; `time_entries` = 42, `attendance_records` = 30 (últ. 11/08/2026) |
| Folhas de ponto | 🟨 | `src/pages/TimesheetsPage.tsx`; `timesheets` = 6 registros |
| Escalas de trabalho | 🟨 | `src/pages/WorkSchedulesPage.tsx`; `work_schedules` = 2, `employee_schedules` = 7; Edge Function `get-employee-schedule` **sem chamador** |
| Solicitação de hora extra | 🟦 | Edge Function `request-overtime` **sem chamador**; **`overtime_requests` = 0** |
| Análise de produtividade | 🟦 | `src/pages/AnalyticsProductivityPage.tsx` roteada; fonte `productivity_logs` = **0 registros**; `useProductivityComparison.ts` órfão |
| Projetos e tarefas | 🟨 | `src/pages/ProjectsPage.tsx`; `projects` = 4, `tasks` = 10 |

#### Analytics, IA e UEBA

| Funcionalidade | Classificação | Evidência |
|---|:---:|---|
| Painel UEBA + risk score | 🟨 | `src/pages/admin/ueba/UEBADashboardPage.tsx:7,24` usa `useTopRiskyUsers` e invoca `risk-score-calculator`; `risk_score_factors` = 8 configurados; **`user_risk_scores` = 0, `behavioral_baselines` = 0** — motor nunca produziu resultado |
| Perfil de risco por funcionário | 🟦 | `src/pages/admin/ueba/EmployeeRiskProfilePage.tsx` — depende de `user_risk_scores` (vazia) |
| Mapeamento MITRE ATT&CK | 🟨 | `mitre_techniques` = 5 técnicas cadastradas; **`incident_mitre_mapping` = 0** — catálogo sem uso |
| Relatórios de análise por IA | 🟨 | `ai_analysis_reports` = 12 registros (últ. 11/08/2026); Edge Functions `analyze-activity`, `summarize-activity`, `behavior-pattern`, `predict-anomaly`, `smart-recommendations`, `trend-forecasting` invocadas pelo front |
| Insights de IA no dashboard | ⬛ | `src/components/dashboard/AIInsights.tsx` importado em `DashboardPage.tsx:19`; porém `src/hooks/useAIInsights.ts` — citado como evidência pela auditoria anterior — **não tem nenhum consumidor** |
| Consulta em linguagem natural | 🟦 | Edge Function `natural-language-query` **sem chamador**; `useNaturalLanguageSearch.ts` órfão |
| Análise de sentimento | 🟦 | Edge Function `sentiment-analysis` **sem chamador**; sem tabela de destino |
| Telemetria de queries | 🟦 | `src/pages/AdminTelemetriaPage.tsx`, `admin/TelemetryTable.tsx`; **`query_telemetry` = 0** |

#### Relatórios e exportação

| Funcionalidade | Classificação | Evidência |
|---|:---:|---|
| Geração de relatórios | 🟨 | `src/pages/ReportsPage.tsx`, `ReportDetailPage.tsx`; Edge Functions `generate-report` e `export-data` invocadas; sem tabela de relatórios persistidos populada |
| Relatórios customizados | 🟦 | `src/pages/CustomReportsPage.tsx` roteada; `saved_filters` = 0 |
| Relatórios agendados | 🟦 | `src/pages/ScheduledReportsPage.tsx`, `send-scheduled-report` invocada; **`scheduled_report_settings` = 0** e **sem agendador** (§5.4) |
| Assinatura/verificação de relatório | 🟦 | `src/pages/VerifyReportPage.tsx`; **`report_signatures` = 0** |
| Exportação de dados / DSAR | 🟦 | `src/pages/DataExportPage.tsx`; Edge Functions `audit-export`, `delete-user-data`, `archive-data`, `backup-data` — **nenhuma com chamador** |

### 6.3 Backend — Edge Functions (84 no repositório)

**33 funções (39%) têm chamador rastreável em `src/`.** As demais **38 (45%) não têm nenhum
chamador** em `src/`, `desktop-agent/`, `scripts/`, `.github/` ou entre si — e, como não existe
`pg_cron` (§5.4), também não têm gatilho agendado.

| Situação | Qtd | Classificação | Funções |
|---|---:|:---:|---|
| Invocadas pelo front, com efeito medido em produção | 8 | ✅ | `slack-notify`, `send-slack-notification`, `send-whatsapp`, `process-violation-alert`, `agent-collector`, `check-geofence`, `validate-agent-key`, `slack-dlq-replay` |
| Invocadas pelo front, sem efeito medido | 25 | 🟨 | `analyze-activity`, `behavior-pattern`, `predict-anomaly`, `risk-score-calculator`, `trend-forecasting`, `smart-recommendations`, `summarize-activity`, `ocr-screenshot`, `export-data`, `generate-report`, `send-scheduled-report`, `send-email-notification`, `send-push-notification`, `send-password-reset`, `send-webhook`, `notify-new-device`, `escalate-dispute-sla`, `mobile-collector`, `webrtc-ice-config`, `get-mapbox-token`, `health-check`, `slack-dlq-bulk-replay`, `slack-fallback-test`, `slack-mttr-monitor`, `slack-weekly-digest` |
| **Sem nenhum chamador e sem agendador** | 38 | ⬛ | `archive-data`, `audit-export`, `auto-categorize`, `backup-data`, `behavioral-baseline-builder`, `bulk-update`, `calculate-productivity`, `cleanup-rate-limit-logs`, `cleanup-sessions`, `compress-screenshots`, `create-monthly-partitions`, `daily-summary`, `delete-user-data`, `expire-recordings`, `external-db-bridge`, `generate-api-key`, `generate-insights`, `get-dashboard-stats`, `get-employee-schedule`, `get-employee-timeline`, `get-policies`, `import-employees`, `invite-user`, `merge-employees`, `natural-language-query`, `process-bulk-import`, `process-screenshot`, `recalculate-metrics`, `refresh-tokens`, `request-overtime`, `rotate-api-keys`, `search-activities`, `send-rate-limit-alert`, `sentiment-analysis`, `sync-employee`, `sync-teams`, `validate-license`, `weekly-report` |
| **Invocadas e ausentes do repositório** | 2 | 🟨 | `award-gamification-points`, `sync-whatsapp-templates` (§5.5) |

> **Nota de método:** as 38 são classificadas ⬛ porque a definição de ⬛ está literalmente
> satisfeita e verificada — código presente, **nenhum caminho de execução chega nele**: sem
> chamador em `src/`, `desktop-agent/`, `scripts/`, `.github/` ou entre as próprias funções, e sem
> agendador possível (`pg_cron` ausente, §5.4). Boa parte delas (`daily-summary`, `weekly-report`,
> `expire-recordings`, `create-monthly-partitions`, `behavioral-baseline-builder`…) viraria 🟨 no
> dia em que existir um agendador — mas classificar por intenção presumida seria inferência, não
> evidência, e a regra deste documento é não subir linha sem prova.

**Segurança — nota positiva:** o commit `10ad549` removeu a Edge Function `migrate-helper` por
expor a `service_role key`. Correção real, verificada no histórico do git.

### 6.4 Dados · `VERIFICADO`

| Objeto | Repositório | Banco vivo | Situação |
|---|---:|---:|---|
| Tabelas base (`public`) | 104 declaradas em migrations | **154** (105 lógicas + 49 partições) | drift |
| Views | — | **8** (`activities`, `all_click_logs`, `all_keystroke_logs`, `all_mobile_activity_logs`, `all_productivity_logs`, `recent_activities`, `slack_webhook_mttr`, `violations`) | ✅ |
| Funções | 33 declaradas | **29** | 6 faltando, 2 extras (§5.3) |
| Triggers | — | **40** | ✅ |
| Políticas RLS | — | **388** | ✅ |
| Materialized views | — | **0** | — |
| Migrations rastreadas | 102 arquivos | **schema inexistente** | 🔴 §5.3 |

| Aspecto de dados | Classificação | Evidência |
|---|:---:|---|
| Modelagem multi-tenant com RLS | ✅ | 388 políticas; `get_user_company_id`, `user_in_company` vivas; 151/154 tabelas com RLS |
| Particionamento mensal de logs de alto volume | 🟨 | 49 partições provisionadas até 2026-12 para `click_logs`, `keystroke_logs`, `mobile_activity_logs`, `productivity_logs` — **todas com 0 registros**; função `create_monthly_partition` viva mas **sem agendador** |
| Retenção de dados | 🟦 | `data_retention_policies` = 3 políticas cadastradas; **nenhum job de expurgo agendado** (§5.4) — a política não é aplicada |
| Storage (3 buckets privados) | 🟨 | `violation-screenshots`, `acknowledgment-photos`, `session-recordings` criados em 04/08/2026 — **0 objetos em todos** |
| RLS ausente em 3 tabelas | 🔴 | §5.6 |

### 6.5 Infraestrutura e CI

| Item | Classificação | Evidência |
|---|:---:|---|
| Pipeline CI (lint, type-check, build, test) | ⬛ | `.github/workflows/ci.yml` — **todos os steps skipped desde 11/08/2026** por falha no `npm ci` (§5.1) |
| Deploy Vercel | 🟨 | `.github/workflows/deploy.yml` — última execução em `main`: **failure** (11/08/2026) |
| Deploy AWS S3 + CloudFront | 🟦 | `.github/workflows/cd.yml` — dispara só em tags `v*`; concorre com o anterior (§5.7) |
| Workflow de build mobile | ⬛ | `.github/workflows/mobile-build.yml:3` — `paths: ['mobile-app/**']`, **diretório inexistente** |
| Build do agente desktop | 🟨 | `.github/workflows/desktop-build.yml` (matriz macOS/Windows/Linux) — última execução: **failure** |
| Security Scan agendado | ⬛ | `.github/workflows/security-scan.yml` — roda diariamente e **falha diariamente** desde ≥12/08 (5 execuções consecutivas em `failure`) |
| Renovate / Dependabot | 🟨 | `renovate.json` + PRs Dependabot ativos — **funcionando, e foi o que introduziu o conflito do eslint** (§5.1) |
| Docker / Compose | 🟦 | `Dockerfile`, `docker-compose{,.dev,.prod}.yml`, `nginx.conf` presentes — sem evidência de uso |
| Kubernetes / Helm / Terraform | 🟦 | `k8s/`, `helm/`, `terraform/` presentes — nenhum pipeline os aplica |
| Prometheus / Grafana | 🟦 | `prometheus/`, `grafana/dashboards/`, `monitoring/` — sem endpoint de métricas verificado |
| Husky + lint-staged + commitlint | 🟨 | `.husky/`, `.lintstagedrc`, `commitlint.config.cjs` — hooks locais; `prepare: husky install` depende de `npm install` que hoje falha |

### 6.6 Integrações

| Integração | Classificação | Evidência de runtime |
|---|:---:|---|
| **Slack** (notificação + DLQ + replay + MTTR) | ✅ | `slack_integrations` = 3, **`slack_delivery_events` = 504** (17 falhas), `slack_notification_dlq` = 61, view `slack_webhook_mttr` viva; funções `slack-notify`, `slack-dlq-replay`, `slack-dlq-bulk-replay`, `slack-mttr-monitor`, `slack-weekly-digest`, `slack-fallback-test` |
| **WhatsApp** | ✅ | `whatsapp_notification_settings` = 8, **`whatsapp_message_logs` = 483** (últ. 11/08/2026); `src/pages/WhatsAppIntegrationPage.tsx`, Edge Function `send-whatsapp` |
| **Mapbox** | 🟨 | Edge Function `get-mapbox-token` invocada por `src/hooks/useMapbox.ts` (órfão) e `MobileDevicesMap.tsx`; sem log de uso |
| **E-mail** (notificações, reset de senha) | 🟨 | `send-email-notification`, `send-password-reset`, `verify-email`, `batch-notifications` — invocadas; sem tabela de log de e-mail |
| **Push notifications** | 🟨 | `send-push-notification` invocada; `usePWAPushNotifications.ts` órfão |
| **Webhooks de saída** | 🟦 | `src/pages/WebhooksPage.tsx` roteada, `send-webhook` invocada; **`webhooks` = 0, `webhook_logs` = 0** — nenhum webhook cadastrado |
| **SIEM (Splunk / Sentinel / CEF)** | 🟦 | Função `enqueue_siem_event` viva e tabelas `siem_connectors`/`siem_event_outbox`/`siem_delivery_log` criadas — **todas com 0 registros**; **nenhuma Edge Function forwarder existe**; planejado para Q2 em `docs/ROADMAP_2026.md:47-49` |
| **Sentry** (error tracking) | 🟨 | `sentry.properties`, `src/lib/errorTracker.ts:114`; `error_reports` = 11 registros locais |
| **Teams** | 🟦 | Edge Function `sync-teams` **sem chamador** |
| **Banco externo (bridge)** | 🟦 | Edge Function `external-db-bridge` **sem chamador** |
| **API pública + chaves** | 🟦 | `src/pages/ApiKeysPage.tsx`, `ApiDocsPage.tsx`; `generate-api-key` e `rotate-api-keys` **sem chamador**; `agent_keys` = 4 (uso interno do agente) |
| **Licenciamento** | 🟦 | Edge Function `validate-license` **sem chamador**; sem tabela de licenças |
| **Billing** | 🟦 | `src/pages/BillingSettingsPage.tsx` roteada; `useBilling.ts` órfão; sem tabela nem provedor de pagamento |

### 6.7 Testes — "o teste protege alguma coisa?"

| Aspecto | Medição | Classificação |
|---|---|:---:|
| Arquivos de teste | **63** (`src/**/*.test.*` + `e2e/auth.spec.ts`) | — |
| Blocos `it()`/`test()` | **1.174** | — |
| Blocos `describe()` | **327** | — |
| Testes desligados (`.skip`, `.todo`, `xit`) | **0** — nenhuma suíte comentada ou pulada | ✅ |
| Runner configurado | `vite.config.ts:42-47` — `include: ['src/**/*.{test,spec}.{ts,tsx}']` | ✅ |
| **Execução em CI** | ❌ **Job `test` pulado em todas as execuções recentes** (§5.1) | ⬛ |
| Contract tests Deno (Edge Functions) | 5 arquivos (`agent-collector`, `mobile-collector`, `check-geofence`, `send-webhook`) — job **falha** | 🟨 |
| E2E Playwright | 1 arquivo (`e2e/auth.spec.ts`); `playwright.config.ts` presente; **nenhum workflow o executa** | 🟦 |
| Cobertura | Sem `coverage` no script `test` (`package.json:14` = `vitest run`), sem `codecov` upload no `ci.yml` | 🟦 |

**Conclusão sobre testes:** a suíte existe, é volumosa e **não está desligada** — o problema não é
teste-espelho nem asserção vácua, é que **nenhum pipeline a executa**. Não foi possível rodá-la
localmente (`npm ci` falha, §3.5), portanto **não se afirma aqui que ela passa ou falha**:
`NAO_VERIFICADO`.

---

## 7. PLANEJADO E SUGERIDO — o que ainda não é código

Extraído de `docs/ROADMAP_2026.md`, `docs/GAP_ANALYSIS_ENTERPRISE.md`, `ROADMAP.md` e
`.lovable/plan.md`, com o estado **medido** de cada item:

| Trimestre | Épico planejado | Status no roadmap | **Estado medido** |
|---|---|---|---|
| Q1 | DLP F1 (clipboard + classifiers BR + políticas) | ✅ Entregue | 🟨 — `dlp_policies` = 3, `dlp_classifiers` = 12, mas **`dlp_incidents` = 0** |
| Q1 | DLP F2 (OCR Tesseract + redação) | 🟡 Próximo | 🟦 — `ocr-screenshot` existe e é invocada; `dlp_redaction_log` = 0 |
| Q1 | DLP F3 (fingerprinting / EDM) | ⚪ Planejado | 🟦 — só a tabela `dlp_fingerprints` (vazia) |
| Q1 | DLP F4 (dashboard analytics) | ⚪ Planejado | 🟦 — `DLPIncidentsPage.tsx` existe, sem dados |
| Q1 | Agente macOS (universal + notarization) | ⚪ Planejado | 🟦 — `desktop-build.yml` tem matriz macOS, mas **falha**; sem build publicado |
| Q1 | Agente Linux (.deb/.rpm/AppImage, Wayland+X11) | ⚪ Planejado | 🟦 — só a matriz do workflow |
| Q2 | UEBA baseline (job diário) | Planejado | 🟦 — `behavioral-baseline-builder` existe **sem chamador nem agendador**; `behavioral_baselines` = 0 |
| Q2 | UEBA risk scoring | Planejado | 🟨 — `risk-score-calculator` **já existe e é invocada** pela UI; `user_risk_scores` = 0 |
| Q2 | UEBA alertas (>2σ) | Planejado | 🟦 — sem trigger correspondente no banco |
| Q2 | MITRE ATT&CK mapping | Planejado | 🟨 — `mitre_techniques` = 5 já populada; `incident_mitre_mapping` = 0 |
| Q2 | SIEM Splunk HEC | Planejado | 🟦 — nenhuma Edge Function `siem-forwarder-*` existe |
| Q2 | SIEM Microsoft Sentinel | Planejado | 🟦 — idem |
| Q2 | SIEM CEF/Syslog | Planejado | 🟦 — idem; `enqueue_siem_event` viva mas outbox vazia |
| Q3 | Frameworks de compliance (SOC2/ISO/HIPAA/PCI/LGPD) | Planejado | 🟦 — `src/pages/CompliancePage.tsx` roteada; **nenhuma tabela `compliance_*` existe** |
| Q3 | Coleta automatizada de evidências | Planejado | 🟦 — inexistente |
| Q3 | DSAR LGPD self-service | Planejado | 🟦 — `delete-user-data` e `audit-export` existem **sem chamador** |
| Q3 | Retention policies por jurisdição + cron | Planejado | 🟦 — `data_retention_policies` = 3, **sem cron** (§5.4) |
| Q3 | Privacy-first mode (blur + pseudonimização) | Planejado | 🟦 — inexistente |
| Q3 | Audit log immutability (WORM + hash chain) | Planejado | 🟦 — inexistente; `audit_logs` = 0 |
| Q4 | SCIM 2.0 provisioning | Planejado | 🟦 — inexistente |
| Q4 | SAML 2.0 SSO | Planejado | 🟦 — inexistente |
| Q4 | OIDC enterprise | Planejado | 🟦 — inexistente |
| Q4 | Multi-region routing / data residency | Planejado | 🟦 — nenhuma tabela `company_regions` |
| Q4 | HA & failover runbook | Planejado | 🟦 — inexistente |
| Q4 | Rate limiting tiered por plano | Planejado | 🟦 — `check_rate_limit` viva, sem noção de plano |
| Q4 | FinOps dashboard (custo por funcionário) | Planejado | 🟦 — inexistente |
| P3 | Forensics / chain of custody | Sugerido (gap analysis) | 🟦 — inexistente |
| P3 | On-premises / air-gapped | Sugerido (gap analysis) | 🟦 — `helm/`, `k8s/`, `terraform/` presentes, sem pipeline |

**Observação sobre o roadmap:** ele está **desatualizado nos dois sentidos** — declara DLP F1 como
"entregue" (na prática, dormente) e lista como "planejado" itens de Q2 que já existem em código
(`risk-score-calculator`, `mitre_techniques`).

---

## 8. FASE D — VERIFICAÇÃO INDEPENDENTE

### 8.1 Recontagem de cobertura

| Escopo | Total real | Inventariado | Método |
|---|---:|---:|---|
| Edge Functions | 84 | 84 (100%) | enumeração de diretório + busca de chamador por nome |
| Migrations | 102 | 102 (100%) | por altitude — extração de `CREATE TABLE`/`CREATE FUNCTION`, comparada com o banco vivo |
| Objetos de banco | 154 tabelas, 8 views, 29 funções, 40 triggers, 388 policies | 100% | consulta direta ao catálogo do PostgreSQL |
| Páginas | 103 | 103 (100%) | enumeração + verificação de rota em `AppRoutes.tsx` |
| Hooks | 475 | 475 (100%) | enumeração + busca de consumidor |
| Workflows CI | 12 | 12 (100%) | leitura do YAML + **conclusão real** das execuções via API |
| `src/components/` (388 arq., 44.102 linhas) | — | **por altitude** | acima do teto de lote; auditado via rotas, páginas e consumidores — **não linha a linha** |

### 8.2 Reprodução dos achados graves

Os cinco achados mais severos foram reproduzidos de forma independente antes de entrar neste
documento:

1. **CI vermelho** — não bastou ler o YAML: as conclusões reais dos jobs foram consultadas na API
   (execução `31532420278`), e a causa-raiz foi **reproduzida localmente** com `npm ci --dry-run`.
2. **Dados fictícios no dashboard** — as três hipóteses iniciais foram lidas em contexto, e
   **duas foram descartadas** (ver §8.3).
3. **`pg_cron` ausente** — confirmado por `SELECT ... FROM pg_extension`, e o guard da migration
   foi lido linha a linha.
4. **Drift de funções** — comparação `comm` entre o conjunto declarado nas migrations e o conjunto
   vivo em `pg_proc`.
5. **Hooks órfãos** — o critério de detecção foi **testado antes de ser aplicado**: usa fronteira
   de palavra (`\buseX\b`), de modo que `useViolationsPage` **não** conta como uso de
   `useViolations`. Foi validado contra controles positivos conhecidos (`useDashboardStats`,
   `useChartColors`, `useRecentAlerts` — todos corretamente classificados como *em uso*), e quatro
   "órfãos" foram reconferidos manualmente. O barrel `src/hooks/index.ts` foi inspecionado: tem
   11 linhas e reexporta apenas 8 hooks, nenhum deles na lista de órfãos.

### 8.3 Correções aplicadas durante a auditoria

> **Correção 1 — `useDashboardPage.ts` e `useProductivityComparison.ts`.**
> A primeira leitura sugeriu "dados fictícios em produção" em `src/hooks/useDashboardPage.ts:72-73`
> (`violations: Math.floor(Math.random() * 10)`) e `src/hooks/useProductivityComparison.ts:103`
> (`trend_percentage` aleatório). **Estava superdimensionado:** a verificação de chamadores mostrou
> que **os dois hooks não têm consumidor algum**. Reclassificados de 🟨 "dado fictício em produção"
> para ⬛ **MORTO_OU_ABANDONADO**. O problema real é código morto, não dado falso ao usuário.

> **Correção 2 — `HeroMetrics.tsx`.**
> `src/components/dashboard/HeroMetrics.tsx:224` gera sparklines com `Math.random()`. A hipótese
> inicial era de métrica falsa exibida ao usuário. **Também descartada:** o componente não é
> importado em lugar nenhum. Reclassificado para ⬛.

> **Correção 3 — auditoria anterior não fabricou evidências.**
> A suspeita inicial era de citações inventadas em `AUDITORIA_ENTERPRISE_SENTINELA.md`. Uma
> amostragem de **18 arquivos citados como prova** confirmou que **todos os 18 existem**. O erro
> daquele documento é outro, e menos grave: classificou como ✅ com base apenas na **existência do
> arquivo**, sem verificar ligação com o banco nem uso real. Registrado em §9 sem retirar-lhe o
> mérito.

**As três correções restaram no documento a favor de quem for lê-lo.** Após elas, sobrou **um único
caso real de dado fictício exposto ao usuário** — o do §5.2 —, e ele é grave justamente por estar
na primeira tela do sistema.

---

## 9. RECONCILIAÇÃO COM A DOCUMENTAÇÃO EXISTENTE

Divergências entre o que os documentos afirmam e o que foi medido. Nenhum deles foi editado.

| Documento | Afirma | Medido | Veredito |
|---|---|---|---|
| `README.md:5` | "Tests: 1888" | **1.174** blocos `it`/`test` em 63 arquivos | ❌ inflado em ~61% |
| `README.md:6` / `VERSION.md` | "Coverage: 100%+ (all 16 modules)" | Sem coleta de cobertura configurada; job `test` **nunca executou** no CI | ❌ sem lastro |
| `README.md:13` | "Files: 4,525+" | 1.257 arquivos TS/TSX em `src/` (o total sobe se contar `node_modules`, ausente) | ⚠️ denominador não declarado |
| `README.md:14` | "Commits: 10,600+" | Não verificado nesta sessão | `NAO_VERIFICADO` |
| `AUDITORIA_ENTERPRISE_SENTINELA.md:5` | "Status Geral: 🟢 Operacional (10/10)" | CI 100% vermelho; 52% das tabelas vazias; sistema sem escrita há 5 dias | ❌ invertido |
| `AUDITORIA_ENTERPRISE_SENTINELA.md` §2 | 18 funcionalidades marcadas ✅ | Arquivos citados **existem** (18/18), mas 9 delas dependem de tabelas vazias | ⚠️ critério de ✅ era "arquivo existe" |
| `ROADMAP.md` | "DLP F1 ✅ entregue — incidentes em tempo real" | `dlp_incidents` = **0 registros** | ⚠️ entregue em código, dormente em produção |
| `docs/FUNCIONALIDADES_COMPLETAS.md` | ~200 itens marcados `[x]` | Amostragem mostra itens `[x]` cujas tabelas estão vazias (ex.: `blocked_ips`, `geo_blocks`) | ⚠️ marca implementação, não uso |
| `docs/MOBILE_APP.md` | Documenta app móvel | Diretório `mobile-app/` **não existe** | ❌ documento sem código |
| `.lovable/plan.md` | Plano da Fase 2 (file transfer tracking) | **Integralmente executado** — tabela, Edge Function, watcher do agente, página e 10 registros reais | ✅ único plano com entrega comprovada ponta a ponta |
| `VERSION.md` | "Current Version: 19.0.0" | `package.json` não expõe versão correspondente; sem tag `v19.0.0` verificada | `NAO_VERIFICADO` |

---

## 10. O QUE ESTA AUDITORIA **NÃO** COBRIU

Declarado, não escondido:

1. **Não executei testes, lint, type-check nem build.** `node_modules` está ausente e `npm ci`
   falha (§5.1). Nenhuma afirmação deste documento diz que algo "compila" ou que "os testes passam".
2. **Não verifiquei quais Edge Functions estão realmente deployadas.** A Management API do Supabase
   exige token `sbp_`, indisponível nesta sessão. Todas as afirmações sobre Edge Functions são
   sobre **o código no repositório e seus chamadores**, não sobre o runtime do Deno.
3. **Não li `src/components/` linha a linha** (388 arquivos, 44.102 linhas — muito acima do teto de
   lote). Foi auditado por altitude: rotas, páginas consumidoras e dependências.
4. **Não auditei o conteúdo interno das 84 Edge Functions** (11.562 linhas). Classifiquei por
   existência, chamador e efeito observável no banco — não por revisão de lógica.
5. **Não verifiquei o front-end em execução.** Nenhuma tela foi aberta em navegador; a análise de UI
   é estática.
6. **Não auditei segurança ofensivamente.** RLS foi verificada por presença/ausência de política,
   **não** por correção das expressões `USING`/`WITH CHECK`. Uma tabela com RLS ativa e política
   permissiva demais apareceria aqui como ✅.
7. **Não verifiquei `examples/`, `benchmarks/`, `screenshots/`, `_smoke/`, `seed/`** nem os scripts
   `*.cjs` da raiz (`smoke-test.cjs`, `debug_fail.cjs`, `test_auth.cjs` etc.), que aparentam ser
   ferramentas de desenvolvimento fora do produto.
8. **Não confirmei qual ambiente é "produção".** Há dois pipelines de deploy para alvos diferentes
   (§5.7); as medições de runtime referem-se ao **banco Supabase acessível via MCP**.

---

## 11. PRÓXIMOS PASSOS

### Barato, seguro e de alto retorno — posso executar sozinho

| # | Ação | Por quê | Esforço |
|---|---|---|---|
| 1 | **Destravar o `npm ci`**: alinhar `@typescript-eslint/*` à major do `eslint` (ou fixar `eslint` em `^8`) e regenerar o lockfile | Reacende **todo** o CI: lint, type-check, build e os 1.174 testes voltam a rodar. É o pré-requisito de qualquer outra melhoria | 1 commit |
| 2 | **Ligar os gráficos do dashboard a dados reais** ou rotulá-los explicitamente como demonstração | Hoje a primeira tela do sistema mostra números inventados a quem decide por eles | pequeno |
| 3 | **Remover os fallbacks com nomes de pessoas fictícias** (`dashboardData.ts:29-42`), trocando por estado vazio honesto | "Carlos Silva — acesso não autorizado detectado" é indistinguível de um alerta real | pequeno |
| 4 | **Ativar RLS** em `achievements`, `departments`, `gamification_leaderboard` | Vazamento entre empresas em sistema multi-tenant | 1 migration |
| 5 | **Criar as 2 Edge Functions ausentes** (`award-gamification-points`, `sync-whatsapp-templates`) ou remover as chamadas | Fio quebrado que gera erro para o usuário | pequeno |
| 6 | **Corrigir `mobile-build.yml`** (remover ou apontar para caminho válido) e escolher **um** pipeline de deploy | Workflow morto e dois deploys concorrentes escondem qual é a verdade de produção | pequeno |
| 7 | **Sincronizar README/VERSION com o medido** (1.174 testes; remover badge de cobertura sem lastro) | O documento que todo dev e todo agente lê primeiro é o mais desatualizado | pequeno |
| 8 | **Podar código morto**: 2 páginas sem rota, `HeroMetrics`, `useDashboardPage`, `useProductivityComparison` e os utilitários órfãos | 77% dos hooks sem consumidor tornam a navegação do código enganosa | médio |

### Toca produção ou muda arquitetura — **decisão sua**

| # | Ação | Por quê | Decisão necessária |
|---|---|---|---|
| 9 | **Habilitar `pg_cron` + `pg_net`** e agendar as 38 automações | Hoje **nenhum** job periódico existe: retenção, expurgo, partições, relatórios semanais, baselines UEBA — nada roda | Requer mudança de extensão no projeto Supabase |
| 10 | **Reconciliar migrations com o banco** (baseline no `schema_migrations`, migration para as 6 funções faltantes, versionar as 2 extras) | Sem isso o ambiente não é reconstruível — o achado mais grave a longo prazo | Requer janela e validação em staging |
| 11 | **Decidir o destino das 38 Edge Functions sem chamador** | Ou ganham agendador (item 9), ou são removidas. Mantê-las custa manutenção e confunde o inventário | Depende do roadmap real |
| 12 | **Definir se o sistema está em piloto ou em produção** | 2 usuários, 8 funcionários e 5 dias sem escrita: as métricas de "uso real" mudam de significado conforme a resposta | Contexto de negócio |
| 13 | **Repriorizar o roadmap 2026** | Está desatualizado nos dois sentidos (§7): declara entregue o que está dormente e planeja o que já existe | Decisão de produto |

---

## 12. CRITÉRIO DE PRONTO — autoavaliação honesta

- [x] 100% dos escopos inventariados, **verificado por recontagem** (§8.1) — com o método declarado
      por escopo (linha a linha vs. altitude)
- [x] Toda funcionalidade classificada em uma das 4 categorias, com evidência citável
- [x] Todo achado grave verificado de forma independente (§8.2) — e **três foram corrigidos para
      menos** (§8.3)
- [x] Runtime marcado `VERIFICADO` ou `NAO_VERIFICADO`, sem meio-termo
- [x] Lacunas declaradas no próprio documento (§10)
- [x] Nada alterado em produção — todas as queries executadas em modo somente leitura
- [ ] **Suíte de testes executada** — impossível nesta sessão (§3.5, §5.1). Esta é a lacuna mais
      relevante da auditoria: não sei se os 1.174 testes passam.

---

*Auditoria produzida em 16/08/2026. Superfície: este arquivo apenas. Nenhum artefato de outra*
*trilha foi editado; nenhuma alteração foi feita no banco de produção.*
