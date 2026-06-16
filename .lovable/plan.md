# Conectores SIEM — Splunk HEC, Microsoft Sentinel, Syslog CEF

Implementação do épico **Q2 2026 — SIEM Connectors** do roadmap. Permite forwarding em tempo real de eventos de violação (DLP, UEBA, security violations) para plataformas SIEM corporativas.

---

## Arquitetura

```text
┌── Eventos Internos ──────────────────────────────────┐
│  security_violations  •  dlp_incidents  •  ueba      │
└────────────────────────┬─────────────────────────────┘
                         │ trigger / realtime
                         ▼
            ┌──────────────────────────┐
            │  siem-event-dispatcher   │  (edge function)
            │  • lê siem_connectors    │
            │  • formata por tipo      │
            │  • enfileira em outbox   │
            └────────────┬─────────────┘
                         │
         ┌───────────────┼────────────────┐
         ▼               ▼                ▼
   [Splunk HEC]    [MS Sentinel]    [Syslog CEF]
   POST /services  Log Analytics    UDP/TCP/TLS
   /collector      Data Collector   RFC 5424
```

---

## 1. Schema (migration)

| Tabela              | Propósito                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `siem_connectors`   | Configuração de cada conector: tipo, endpoint, credenciais (cifradas), event_filters, is_active, company_id    |
| `siem_event_outbox` | Fila com retry: connector_id, event_type, payload jsonb, status (pending/sent/failed), attempts, next_retry_at |
| `siem_delivery_log` | Histórico imutável de entregas: connector_id, event_id, status, latency_ms, http_code, error                   |

Tipos suportados (enum `siem_connector_type`): `splunk_hec`, `microsoft_sentinel`, `syslog_cef`, `generic_webhook`.

Eventos forwarded (enum `siem_event_type`): `security_violation`, `dlp_incident`, `ueba_anomaly`, `auth_event`, `policy_change`.

RLS por `company_id`; credenciais sempre acessadas via service_role em edge functions.

---

## 2. Edge Functions (3 novas)

### `siem-event-dispatcher` (cron a cada 30s + on-demand)

- Lê outbox onde `status='pending' AND next_retry_at <= now()`
- Para cada conector ativo do evento, chama o forwarder específico
- Atualiza status, incrementa attempts, calcula `next_retry_at` com exponential backoff (30s → 5m → 30m, max 5 tentativas)
- Grava em `siem_delivery_log`

### `siem-test-connector` (on-demand, admin-only)

- Recebe `connector_id`, envia evento sintético de teste
- Retorna status, latência, resposta do SIEM

### `siem-connector-manager` (CRUD + criptografia)

- POST/PUT criptografa `auth_token`/`api_key` via Web Crypto API antes de gravar
- GET retorna config sem credenciais (apenas masked)

### Trigger DB

- `on_security_violation_insert` → enfileira em `siem_event_outbox` para todos os conectores ativos com `security_violation` em `event_filters`
- Mesmo padrão para `dlp_incidents` e `user_risk_scores` (delta crítico)

---

## 3. Formatadores (shared)

`supabase/functions/_shared/siem/`:

| Arquivo              | Responsabilidade                                                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `splunkHec.ts`       | POST `https://<host>/services/collector/event` com header `Authorization: Splunk <token>`; payload `{event, sourcetype, source, host, time}`              |
| `msSentinel.ts`      | POST `https://<workspaceId>.ods.opinsights.azure.com/api/logs?api-version=2016-04-01` com HMAC-SHA256 signature; custom log type `SentinelaViolations_CL` |
| `syslogCef.ts`       | Format CEF 0\|Sentinela\|SecureWatch\|1.0\|<eventId>\|<name>\|<severity>\|<extensions>; envio via UDP (Deno.DatagramConn) ou TCP/TLS                      |
| `eventNormalizer.ts` | Converte evento interno → estrutura comum {timestamp, severity, employee, type, mitre_techniques, evidence_url}                                           |

---

## 4. UI Admin

`src/pages/admin/siem/`

- **`SIEMConnectorsPage.tsx`** (`/admin/siem`)
  - Lista de conectores com status (last_success, queue_depth, error_rate 24h)
  - Botão "Adicionar conector" → wizard
  - Ações: editar, testar, pausar, ver logs
- **`SIEMConnectorWizard.tsx`** (modal/sheet)
  - Step 1: tipo (Splunk/Sentinel/Syslog/Webhook) com cards visuais
  - Step 2: campos específicos por tipo (endpoint, token, workspace_id, syslog host:port)
  - Step 3: filtros de eventos (checkboxes por tipo + severity mínima)
  - Step 4: teste de conexão antes de salvar
- **`SIEMDeliveryLogPage.tsx`** (`/admin/siem/:connectorId/logs`)
  - Tabela de últimas 1000 entregas com filtro por status
  - Realtime via Supabase channel
  - Métricas: taxa de sucesso, latência P95, eventos/min

Componentes:

- `<SIEMConnectorCard />` — card resumo com badge de status semântico
- `<SIEMHealthIndicator />` — bolinha verde/amarelo/vermelho baseado em error_rate

---

## 5. Hooks & i18n

Hooks novos em `src/hooks/`:

- `useSIEMConnectors()` — list + CRUD via `siem-connector-manager`
- `useSIEMDeliveryLog(connectorId)` — query + realtime
- `useSIEMTest()` — mutation para teste

i18n completo (pt-BR, en-US, es) — labels, descrições de tipos, mensagens de erro, instruções de setup por SIEM.

---

## 6. Configuração & Performance

- Outbox processada em batches de 100 por invocação
- Timeout HTTP por conector: 5s (configurável)
- Circuit breaker: 5 falhas consecutivas → pausa conector 10min + alerta admin
- Métricas estruturadas: `siem_dispatch_total`, `siem_dispatch_latency_ms`, `siem_dispatch_failures`
- Cleanup `siem_delivery_log` >30 dias via cron semanal

---

## 7. Compliance & Segurança

- Credenciais SIEM **sempre cifradas em repouso** via Web Crypto API (chave em secret `SIEM_ENCRYPTION_KEY`)
- Audit log de mudanças em `siem_connectors` (settings_audit_log)
- PII em payloads respeita modo privacy-first (pseudonimização opcional)
- TLS obrigatório para Splunk/Sentinel; Syslog suporta TLS via opt-in

---

## 8. Cron Jobs (pg_cron)

Via insert tool:

- `siem-event-dispatcher`: a cada 30 segundos
- `siem-delivery-log` cleanup >30d: semanal domingo 04:00 UTC

---

## 9. Triggers DB (na migration)

```sql
CREATE TRIGGER trg_siem_violation_dispatch
AFTER INSERT ON security_violations
FOR EACH ROW EXECUTE FUNCTION enqueue_siem_event('security_violation');

-- Análogo para dlp_incidents e user_risk_scores (com WHEN level IN ('high','critical'))
```

Função `enqueue_siem_event(event_type)` consulta `siem_connectors` ativos da empresa e insere N rows em `siem_event_outbox`.

---

## 10. Sub-fases (sequencial em uma passagem)

| Sub-fase | Entregável                                                             |
| -------- | ---------------------------------------------------------------------- |
| **A**    | Migration: tabelas + enums + triggers + função enqueue + RLS           |
| **B**    | Shared formatters (splunkHec, msSentinel, syslogCef, eventNormalizer)  |
| **C**    | Edge functions: dispatcher + connector-manager + test-connector + cron |
| **D**    | UI: SIEMConnectorsPage + Wizard + DeliveryLogPage + componentes        |
| **E**    | Hooks + i18n + integração no menu admin + RouteGuard                   |

---

## 11. Arquivos Criados/Modificados

**Novos (~15):**

- `supabase/migrations/<ts>_siem_connectors.sql`
- `supabase/functions/_shared/siem/splunkHec.ts`
- `supabase/functions/_shared/siem/msSentinel.ts`
- `supabase/functions/_shared/siem/syslogCef.ts`
- `supabase/functions/_shared/siem/eventNormalizer.ts`
- `supabase/functions/_shared/siem/encryption.ts`
- `supabase/functions/siem-event-dispatcher/index.ts`
- `supabase/functions/siem-connector-manager/index.ts`
- `supabase/functions/siem-test-connector/index.ts`
- `src/pages/admin/siem/SIEMConnectorsPage.tsx`
- `src/pages/admin/siem/SIEMConnectorWizard.tsx`
- `src/pages/admin/siem/SIEMDeliveryLogPage.tsx`
- `src/components/siem/SIEMConnectorCard.tsx`
- `src/components/siem/SIEMHealthIndicator.tsx`
- `src/hooks/useSIEMConnectors.ts`
- `src/hooks/useSIEMDeliveryLog.ts`

**Modificados (5):**

- `src/routes/AppRoutes.tsx` (3 rotas)
- `src/integrations/supabase/types.ts` (auto)
- `supabase/config.toml` (3 functions)
- `src/lib/i18n.ts` (chaves SIEM)
- `src/components/layout/MainLayout.tsx` ou nav admin (link "SIEM")

**Secret novo:** `SIEM_ENCRYPTION_KEY` (será solicitado ao iniciar implementação).

---

## Próximo Passo

Aprovar para iniciar pela sub-fase **A** (schema + triggers), seguindo sequencial até **E** sem interrupções, conforme preferência do usuário.
