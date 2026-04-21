
# DLP com OCR + Bloqueio de Clipboard — Arquitetura Técnica

Implementação do gap **P0 #1** da análise enterprise: inspeção em tempo real de conteúdo sensível em screenshots e clipboard, com bloqueio/redação ativa antes do vazamento.

---

## Visão Geral do Fluxo

```text
┌─────────────── DESKTOP AGENT (Electron) ───────────────┐
│                                                          │
│  [Clipboard Watcher]──┐    [Screenshot Service]──┐      │
│         │             │            │             │      │
│         ▼             │            ▼             │      │
│  [Local DLP Engine]   │    [OCR Local Tesseract] │      │
│   • Regex (PII/PCI)   │            │             │      │
│   • Keywords          │            ▼             │      │
│   • Doc fingerprints  │    [Local DLP Engine]    │      │
│         │             │            │             │      │
│         ▼             │            ▼             │      │
│   ┌─ MATCH? ─┐        │      ┌─ MATCH? ─┐        │      │
│   │  BLOCK   │        │      │  REDACT  │        │      │
│   │  CLEAR   │        │      │  (blur)  │        │      │
│   └────┬─────┘        │      └────┬─────┘        │      │
│        │              │           │              │      │
│        └──────────────┴───────────┘              │      │
│                       │                          │      │
│                       ▼                          │      │
│              [DataSender (queue)]                │      │
└───────────────────────┬──────────────────────────┘      
                        │ HTTPS
                        ▼
┌──────────── SUPABASE EDGE FUNCTIONS ─────────────┐
│  dlp-policy-sync   • dlp-incident   • ocr-deep   │
│  (pull rules)      (log violation)  (cloud OCR)  │
└──────────────────────┬───────────────────────────┘
                       ▼
               [Postgres + RLS]
   dlp_policies • dlp_incidents • dlp_fingerprints
```

---

## 1. Schema do Banco (novas tabelas)

| Tabela | Propósito |
|---|---|
| `dlp_policies` | Regras (regex, keywords, severity, action: block/redact/alert) por empresa |
| `dlp_classifiers` | Classificadores nomeados (CPF, CNPJ, cartão, AWS key, JWT, e-mail) |
| `dlp_fingerprints` | Hashes SHA-256 de documentos sigilosos (Exact Data Match) |
| `dlp_incidents` | Eventos: tipo (clipboard/screenshot), policy_id, evidência redacted, employee_id |
| `dlp_redaction_log` | Auditoria de bloqueios/redações para compliance |

Todas com RLS por `company_id` e índices em `(company_id, created_at DESC)`.

---

## 2. Desktop Agent — Novos Módulos

`desktop-agent/src/services/dlp/`

| Arquivo | Responsabilidade |
|---|---|
| `dlpEngine.ts` | Avalia texto contra políticas (regex compilados, Aho-Corasick para keywords) |
| `clipboardDLP.ts` | Substitui `printScreenBlocker` clipboard watcher; intercepta TEXTO copiado a cada 500ms; se match → `clipboard.clear()` + log |
| `ocrService.ts` | Wrapper sobre `tesseract.js` (worker pool); processa screenshot antes de enviar |
| `screenshotRedactor.ts` | Recebe bounding boxes do OCR + matches DLP, aplica blur via `sharp` nos retângulos sensíveis |
| `policySync.ts` | Pull periódico (15min) de `dlp_policies` via edge function; cache local em `electron-store` |
| `fingerprintMatcher.ts` | SHA-256 rolling hash em arquivos abertos (via `chokidar` em pastas configuradas) |

Integração no `main.ts`:
- Substitui `PrintScreenBlocker.checkClipboard()` pelo novo `ClipboardDLP` (mantém bloqueio de PrintScreen).
- `ScreenshotService` chama `ocrService.extract() → dlpEngine.scan() → screenshotRedactor.apply()` antes de enfileirar upload.

---

## 3. OCR — Estratégia em 2 camadas

**Camada 1 (local, rápida):** `tesseract.js` em Web Worker dentro do Electron
- Português + Inglês, modo `LSTM_ONLY`
- Latência alvo: <800ms para screenshot 1920×1080
- Retorna texto + `bbox` por palavra → permite redação cirúrgica

**Camada 2 (cloud, profunda):** edge function `ocr-deep` usando Lovable AI (`google/gemini-2.5-flash`) com vision
- Acionada apenas quando local OCR tem `confidence < 60` ou screenshot >2MP
- Resultado também alimenta busca full-text histórica

---

## 4. Edge Functions (novas)

| Função | Método | Função |
|---|---|---|
| `dlp-policy-sync` | GET | Retorna políticas ativas + classifiers para o agent (cached 15min) |
| `dlp-incident-report` | POST | Recebe incidente do agent, valida `x-agent-key`, grava em `dlp_incidents`, dispara alerta |
| `ocr-deep-scan` | POST | OCR avançado via Gemini Vision quando local falha |
| `dlp-fingerprint-upload` | POST | Admin envia documento → gera hash chunks SHA-256 → grava em `dlp_fingerprints` |

Todas com CORS, validação Zod, JWT validation manual (verify_jwt=false).

---

## 5. Classifiers Pré-Configurados

Seed inicial em migration:
- **CPF/CNPJ** — regex com validação de dígito verificador
- **Cartão de crédito** — Luhn check (Visa/Master/Amex/Elo)
- **E-mail / telefone BR** — regex
- **Chaves de API** — AWS (`AKIA[0-9A-Z]{16}`), Google (`AIza[0-9A-Za-z_-]{35}`), GitHub PAT (`ghp_[A-Za-z0-9]{36}`), JWT, Slack token
- **PIX key** — CPF/CNPJ/email/telefone/random UUID
- **Senha em texto claro** — heurística contexto `(senha|password)\s*[:=]`

Cada classifier com `severity` (low/medium/high/critical) e `default_action` (alert/redact/block).

---

## 6. UI Admin (novas rotas)

`src/pages/admin/dlp/`
- `DLPPoliciesPage.tsx` — CRUD de políticas, toggle por classifier, preview de regex
- `DLPIncidentsPage.tsx` — feed em tempo real (Supabase Realtime) com evidência blurred
- `DLPFingerprintsPage.tsx` — upload de docs sigilosos → fingerprinting
- `DLPDashboardWidget.tsx` — KPIs (top vazamentos bloqueados, classifiers mais acionados)

Componente compartilhado: `<RedactedPreview />` que mostra screenshot com áreas borradas + lista dos matches.

---

## 7. Configuração & Performance

- `CONFIG.DLP_ENABLED`, `CONFIG.DLP_POLICY_REFRESH_MS`, `CONFIG.OCR_MAX_IMAGE_MP`
- Worker pool de OCR (2 workers) para não travar capturas
- Throttle clipboard watcher: skip se conteúdo idêntico ao anterior (hash xxhash)
- Política "fail-open" configurável: se OCR/DLP falhar, screenshot vai sem redação mas com flag `dlp_unverified=true`

---

## 8. Compliance & Privacidade

- Texto extraído por OCR **nunca** é gravado em claro no banco; apenas hashes + bounding boxes + classifier name
- Evidência (screenshot redacted) sobe para bucket `violation-screenshots` com áreas sensíveis já borradas no cliente
- Log imutável em `dlp_redaction_log` (append-only via RLS)
- LGPD: agent expõe modo "privacy-first" que registra apenas contagem de matches, sem evidência visual

---

## 9. Entrega Faseada

| Fase | Entregável |
|---|---|
| **F1 (MVP)** | Tabelas + classifiers BR (CPF/CNPJ/cartão) + clipboard blocker + UI políticas |
| **F2** | OCR local Tesseract + redação automática em screenshots |
| **F3** | Document fingerprinting + cloud OCR fallback (Gemini) |
| **F4** | Dashboard analytics + integração com motor de incidentes existente |

---

## Dependências Novas

**Desktop agent**: `tesseract.js`, `sharp`, `chokidar`, `xxhash-wasm`, `aho-corasick`
**Edge functions**: nenhuma nova (Lovable AI já disponível)
**Frontend**: nenhuma nova (shadcn já cobre UI)

---

## Próximo Passo

Aprovar o plano para iniciar pela **Fase 1**: migration das tabelas DLP + classifiers BR seed + módulo `clipboardDLP.ts` no agente + página `DLPPoliciesPage`.
