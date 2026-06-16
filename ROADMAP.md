# SENTINELA — Roadmap Executivo 2026

Sumário executivo do roadmap de 4 trimestres. Detalhes completos em [`docs/ROADMAP_2026.md`](./docs/ROADMAP_2026.md).

```text
Q1 2026          Q2 2026          Q3 2026          Q4 2026
─────────        ─────────        ─────────        ─────────
DLP+OCR (P0)  →  UEBA ML (P1)  →  Compliance (P2) → SCIM/SAML (P2)
macOS Agent      SIEM Splunk      ISO/SOC2/HIPAA    Multi-region
Linux Agent      SIEM Sentinel    DSAR LGPD         Hardening
```

## Trimestres

| Q      | Tema                | Prioridade | Principais entregas                                                                     |
| ------ | ------------------- | ---------- | --------------------------------------------------------------------------------------- |
| **Q1** | Foundation          | P0         | DLP F2-F4 (OCR + fingerprinting + dashboard); agentes macOS e Linux                     |
| **Q2** | Threat Detection    | P1         | UEBA com risk scoring ML; MITRE ATT&CK; conectores SIEM (Splunk, Sentinel, CEF)         |
| **Q3** | Compliance          | P2         | Frameworks SOC 2/ISO 27001/HIPAA/PCI/LGPD; DSAR; retention policies; audit immutability |
| **Q4** | Enterprise Platform | P2         | SCIM 2.0; SAML/OIDC; multi-region; FinOps; rate limiting tiered                         |

## Status Atual (abr/2026)

- ✅ **DLP F1** entregue — clipboard blocker, classifiers BR (CPF/CNPJ/cartão/PIX), políticas, incidentes em tempo real
- 🟡 **DLP F2** próximo — OCR local Tesseract + redação automática
- ⚪ Demais épicos planejados conforme cronograma

## Documentação

- [`docs/GAP_ANALYSIS_ENTERPRISE.md`](./docs/GAP_ANALYSIS_ENTERPRISE.md) — análise de gaps vs. líderes de mercado
- [`docs/ROADMAP_2026.md`](./docs/ROADMAP_2026.md) — roadmap completo
- [`docs/ROADMAP_Q1_2026.md`](./docs/ROADMAP_Q1_2026.md) — user stories Q1
- [`.lovable/plan.md`](./.lovable/plan.md) — arquitetura técnica DLP

## Governança

Revisão mensal, demo trimestral, re-priorização apenas no início de cada Q. Definition of Done: código + testes ≥80% + docs + i18n (pt-BR/en-US/es).
