
# Roadmap Fásico 4 Trimestres — Gaps Enterprise P0→P2

Plano executivo cobrindo as prioridades **P0, P1 e P2** da análise de gaps enterprise (`docs/GAP_ANALYSIS_ENTERPRISE.md`), distribuídas em 4 trimestres com entregáveis, dependências e métricas de sucesso.

---

## Visão Geral

```text
Q1 2026          Q2 2026          Q3 2026          Q4 2026
─────────        ─────────        ─────────        ─────────
DLP+OCR (P0)  →  UEBA ML (P1)  →  Compliance (P2) → SCIM/SAML (P2)
macOS Agent      SIEM Splunk      ISO/SOC2/HIPAA    Multi-region
Linux Agent      SIEM Sentinel    DSAR LGPD         Hardening
```

---

## Q1 2026 — Foundation P0 (DLP + Endpoint Coverage)

**Tema:** Bloquear vazamentos de dados e cobrir endpoints heterogêneos.

| Épico | Entregável | Fase |
|---|---|---|
| **DLP F2** | OCR local Tesseract + redação automática em screenshots | continua F1 |
| **DLP F3** | Document fingerprinting (Exact Data Match) + cloud OCR fallback (Gemini) | nova |
| **DLP F4** | Dashboard analytics + integração motor de incidentes | nova |
| **macOS Agent** | Build Electron universal (Intel + Apple Silicon), notarization, screen recording permissions | nova |
| **Linux Agent** | Build .deb + .rpm + AppImage; Wayland + X11 capture | nova |

**Métricas de sucesso:**
- 100% screenshots com OCR e DLP scan antes do upload
- Latência OCR local <800ms (P95)
- macOS + Linux instalados em ≥3 estações de teste

---

## Q2 2026 — Threat Detection P1 (UEBA + SIEM)

**Tema:** Transformar SENTINELA de "monitoring" em "threat detection".

| Épico | Entregável |
|---|---|
| **UEBA Baseline** | Tabela `behavioral_baselines` por usuário (apps, horários, sites, volume); job diário de cálculo |
| **UEBA Risk Scoring** | Edge function `risk-score-calculator` com Isolation Forest (Python via Pyodide) ou heurística estatística |
| **UEBA Alertas** | Trigger automático quando risk_score muda >2σ; integração com `alert-engine` existente |
| **MITRE ATT&CK Mapping** | Tabela `mitre_techniques` + mapeamento de incidentes em técnicas (T1078, T1567, T1530) |
| **SIEM Splunk HEC** | Edge function `siem-forwarder-splunk` com autenticação token + retry queue |
| **SIEM Microsoft Sentinel** | Conector via Log Analytics Data Collector API |
| **SIEM CEF/Syslog** | Output formatter padrão CEF + UDP/TCP forwarder configurável |

**Métricas de sucesso:**
- Risk score calculado para 100% dos usuários ativos
- ≥5 técnicas MITRE mapeadas com detecção automática
- 3 conectores SIEM operacionais (Splunk, Sentinel, Syslog genérico)

---

## Q3 2026 — Compliance & Governança P2

**Tema:** Acelerar vendas reguladas com frameworks pré-configurados.

| Épico | Entregável |
|---|---|
| **Frameworks Compliance** | Tabelas `compliance_frameworks`, `compliance_controls`, `compliance_evidence`; seed SOC 2, ISO 27001, HIPAA, PCI-DSS, LGPD |
| **Evidence Collection** | Job automatizado coleta evidências (logs, configs, RLS policies, MFA status) por controle |
| **Compliance Dashboard** | Página `/admin/compliance` com % cobertura por framework, gaps, próximas auditorias |
| **DSAR Workflow LGPD** | Página self-service para titular solicitar export/deleção; workflow de aprovação admin; export em ZIP assinado |
| **Retention Policies** | Tabela `retention_policies` por jurisdição + edge function cron `data-retention-enforcer` |
| **Privacy-First Mode** | Toggle agente: blur de janelas pessoais (regex título) + opt-in pseudonimização |
| **Audit Log Immutability** | Bucket WORM (append-only RLS) + hash chain SHA-256 entre registros consecutivos |

**Métricas de sucesso:**
- ≥4 frameworks com 100% controles mapeados
- DSAR end-to-end <72h (requisito LGPD)
- Audit log com integridade verificável (hash chain válido)

---

## Q4 2026 — Enterprise Platform P2

**Tema:** Atender requisitos IT enterprise (SSO, provisioning, multi-region).

| Épico | Entregável |
|---|---|
| **SCIM 2.0 Provisioning** | Edge function `scim-v2` (Users + Groups endpoints) compatível com Okta, Azure AD, Workday |
| **SAML 2.0 SSO** | Integração via Supabase Auth SAML; metadata XML por empresa; JIT provisioning |
| **OIDC Enterprise** | Suporte IdP-initiated com claims customizados (role mapping) |
| **Multi-Region Routing** | Tabela `company_regions` (BR/US/EU); roteamento de uploads por região; documentação data residency |
| **HA & Failover Docs** | Runbook RTO/RPO; testes de failover documentados |
| **API Rate Limiting Tiered** | Middleware edge function com limites por plano (free/pro/enterprise) |
| **FinOps Dashboard** | Página `/admin/finops` com custo por funcionário (storage + AI tokens + edge invocations) |

**Métricas de sucesso:**
- SCIM certificado em ≥2 IdPs (Okta + Azure AD)
- SAML SSO ativo em ≥1 cliente piloto
- Data residency documentada e auditável

---

## Dependências & Riscos

| Risco | Mitigação |
|---|---|
| OCR local trava agente em hardware fraco | Worker pool + fail-open + telemetria de latência |
| ML risk scoring com falsos positivos | Período shadow-mode 30 dias antes de alertar |
| SCIM/SAML requer plano Supabase Pro | Validar custo no início do Q4 |
| Multi-region exige replicação de banco | Spike técnico em Q3 para validar arquitetura |

---

## Governança do Roadmap

- **Revisão mensal** de progresso vs. métricas
- **Demo trimestral** com stakeholders ao final de cada Q
- **Re-priorização** permitida apenas no início de cada Q
- **Definition of Done** por épico: código + testes (≥80% cov) + docs + i18n (pt-BR/en-US/es)

---

## Entregáveis Documentais

Ao aprovar, será criado:
1. `docs/ROADMAP_2026.md` — versão completa com todos os épicos detalhados
2. `docs/ROADMAP_Q1_2026.md` — breakdown de user stories do trimestre atual
3. Atualização de `ROADMAP.md` (raiz) com sumário executivo
4. Atualização de `docs/AUDITORIA_22_DIMENSOES.md` referenciando os épicos por dimensão impactada

---

## Próximo Passo

Aprovar para gerar a documentação completa do roadmap e iniciar Q1 pelo épico **DLP F2 (OCR local Tesseract + redação automática)**, dando continuidade à Fase 1 já entregue.
