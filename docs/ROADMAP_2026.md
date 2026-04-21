# Roadmap 2026 — SENTINELA Enterprise

Roadmap fásico de 4 trimestres cobrindo as prioridades **P0, P1 e P2** definidas em [`docs/GAP_ANALYSIS_ENTERPRISE.md`](./GAP_ANALYSIS_ENTERPRISE.md). Cada trimestre tem tema, épicos, entregáveis, métricas de sucesso e riscos.

---

## Visão Geral

```text
Q1 2026          Q2 2026          Q3 2026          Q4 2026
─────────        ─────────        ─────────        ─────────
DLP+OCR (P0)  →  UEBA ML (P1)  →  Compliance (P2) → SCIM/SAML (P2)
macOS Agent      SIEM Splunk      ISO/SOC2/HIPAA    Multi-region
Linux Agent      SIEM Sentinel    DSAR LGPD         Hardening
```

**Status atual:** Fase 1 do DLP (clipboard + políticas + classifiers BR) **entregue** em abr/2026.

---

## Q1 2026 — Foundation P0 (DLP + Endpoint Coverage)

**Tema:** Bloquear vazamentos de dados e cobrir endpoints heterogêneos.

| Épico | Entregável | Status |
|---|---|---|
| DLP F1 | Tabelas + classifiers BR + clipboard blocker + UI políticas | ✅ Entregue |
| DLP F2 | OCR local Tesseract + redação automática em screenshots | 🟡 Próximo |
| DLP F3 | Document fingerprinting (Exact Data Match) + cloud OCR fallback (Gemini) | ⚪ Planejado |
| DLP F4 | Dashboard analytics + integração motor de incidentes | ⚪ Planejado |
| macOS Agent | Build Electron universal (Intel + Apple Silicon), notarization, screen recording permissions | ⚪ Planejado |
| Linux Agent | Build .deb + .rpm + AppImage; Wayland + X11 capture | ⚪ Planejado |

### Métricas de Sucesso
- 100% screenshots com OCR e DLP scan antes do upload
- Latência OCR local <800ms (P95)
- macOS + Linux instalados em ≥3 estações de teste

---

## Q2 2026 — Threat Detection P1 (UEBA + SIEM)

**Tema:** Transformar SENTINELA de "monitoring" em "threat detection".

| Épico | Entregável |
|---|---|
| UEBA Baseline | `behavioral_baselines` por usuário (apps, horários, sites, volume); job diário |
| UEBA Risk Scoring | Edge function `risk-score-calculator` (Isolation Forest ou heurística estatística) |
| UEBA Alertas | Trigger automático quando risk_score muda >2σ; integração com `alert-engine` |
| MITRE ATT&CK Mapping | `mitre_techniques` + mapeamento de incidentes (T1078, T1567, T1530) |
| SIEM Splunk HEC | `siem-forwarder-splunk` com token + retry queue |
| SIEM Microsoft Sentinel | Conector via Log Analytics Data Collector API |
| SIEM CEF/Syslog | Output formatter padrão CEF + UDP/TCP forwarder configurável |

### Métricas de Sucesso
- Risk score calculado para 100% dos usuários ativos
- ≥5 técnicas MITRE mapeadas com detecção automática
- 3 conectores SIEM operacionais

---

## Q3 2026 — Compliance & Governança P2

**Tema:** Acelerar vendas reguladas com frameworks pré-configurados.

| Épico | Entregável |
|---|---|
| Frameworks Compliance | `compliance_frameworks/controls/evidence`; seed SOC 2, ISO 27001, HIPAA, PCI-DSS, LGPD |
| Evidence Collection | Job automatizado coleta evidências (logs, configs, RLS, MFA) por controle |
| Compliance Dashboard | `/admin/compliance` com % cobertura, gaps, próximas auditorias |
| DSAR Workflow LGPD | Self-service titular: export/deleção; aprovação admin; ZIP assinado |
| Retention Policies | `retention_policies` por jurisdição + cron `data-retention-enforcer` |
| Privacy-First Mode | Toggle agente: blur janelas pessoais + opt-in pseudonimização |
| Audit Log Immutability | Bucket WORM + hash chain SHA-256 entre registros |

### Métricas de Sucesso
- ≥4 frameworks com 100% controles mapeados
- DSAR end-to-end <72h (requisito LGPD)
- Audit log com integridade verificável

---

## Q4 2026 — Enterprise Platform P2

**Tema:** Atender requisitos IT enterprise (SSO, provisioning, multi-region).

| Épico | Entregável |
|---|---|
| SCIM 2.0 Provisioning | `scim-v2` (Users + Groups) compatível com Okta, Azure AD, Workday |
| SAML 2.0 SSO | Supabase Auth SAML; metadata XML por empresa; JIT provisioning |
| OIDC Enterprise | IdP-initiated com claims customizados (role mapping) |
| Multi-Region Routing | `company_regions` (BR/US/EU); roteamento de uploads; data residency |
| HA & Failover Docs | Runbook RTO/RPO; testes de failover documentados |
| API Rate Limiting Tiered | Middleware com limites por plano (free/pro/enterprise) |
| FinOps Dashboard | `/admin/finops` com custo por funcionário (storage + AI + edge) |

### Métricas de Sucesso
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

## Governança

- **Revisão mensal** de progresso vs. métricas
- **Demo trimestral** com stakeholders ao final de cada Q
- **Re-priorização** permitida apenas no início de cada Q
- **Definition of Done** por épico: código + testes (≥80% cov) + docs + i18n (pt-BR/en-US/es)

---

## Referências
- [`docs/GAP_ANALYSIS_ENTERPRISE.md`](./GAP_ANALYSIS_ENTERPRISE.md) — análise completa de gaps
- [`docs/ROADMAP_Q1_2026.md`](./ROADMAP_Q1_2026.md) — breakdown de user stories Q1
- [`.lovable/plan.md`](../.lovable/plan.md) — arquitetura técnica DLP
