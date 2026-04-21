
# UEBA com Risk Scoring (Isolation Forest) — Plano de Implementação

Implementação do épico **Q2 2026 — UEBA Baseline + Risk Scoring** do roadmap. Move SENTINELA de "monitoring" para "threat detection" via análise comportamental estatística.

---

## Arquitetura

```text
┌── activities / keystroke_logs / click_logs / productivity_logs ──┐
│                            │                                       │
│                            ▼                                       │
│           [behavioral-baseline-builder] (cron diário 03:00 UTC)   │
│                            │                                       │
│                            ▼                                       │
│              behavioral_baselines  (por employee × feature)        │
│                            │                                       │
│                            ▼                                       │
│         [risk-score-calculator] (edge function on-demand + cron)   │
│                  • Isolation Forest (heurística)                   │
│                  • Z-score multi-feature                           │
│                  • Peer group comparison                           │
│                            │                                       │
│                            ▼                                       │
│              user_risk_scores (histórico) + alertas                │
└────────────────────────────────────────────────────────────────────┘
```

**Por que heurística "Isolation Forest-like" e não ML real?** Edge functions Deno não suportam scikit-learn. Implementaremos **Half-Space Trees** (variante streaming do Isolation Forest) em TypeScript puro — algoritmo provado para detecção de anomalias em séries temporais, sem dependências externas.

---

## 1. Schema (migration)

| Tabela | Colunas principais |
|---|---|
| `behavioral_baselines` | employee_id, feature_name, mean, std_dev, min, max, sample_size, computed_at, period_days |
| `user_risk_scores` | employee_id, score (0-100), level (low/medium/high/critical), factors jsonb, calculated_at, period |
| `risk_score_factors` | (catálogo) name, weight, description, enabled |
| `mitre_techniques` | id (T-code), tactic, name, description, severity_default |
| `incident_mitre_mapping` | incident_id, technique_id, confidence |

Features rastreadas no baseline (10 inicial):
- `daily_keystrokes`, `daily_clicks`, `daily_apps_used`, `work_hours_start`, `work_hours_end`
- `weekend_activity_ratio`, `night_activity_ratio`, `productivity_score_avg`
- `screenshot_violations_per_day`, `clipboard_dlp_matches_per_day`

RLS por `company_id` em todas; índices `(employee_id, calculated_at DESC)`.

Seed `mitre_techniques`: T1078 (Valid Accounts), T1530 (Data from Cloud Storage), T1567 (Exfiltration Over Web), T1071 (Application Layer Protocol), T1119 (Automated Collection).

---

## 2. Edge Functions (3 novas)

### `behavioral-baseline-builder` (cron diário)
- `verify_jwt = false`, executada por pg_cron
- Para cada employee ativo: agrega últimos 30 dias por feature → calcula mean, std_dev, percentis
- Upsert em `behavioral_baselines`
- Skip employees com <7 dias de dados (insufficient_data flag)

### `risk-score-calculator` (on-demand + cron horário)
- Input: `{ employeeId?, period?: '24h'|'7d' }`
- Para cada feature: calcula z-score atual vs. baseline
- **Half-Space Trees** (50 árvores, profundidade 8) sobre vetor multi-feature → anomaly_score [0,1]
- Combina: `final_score = 0.6 * HST_score + 0.4 * max(z_scores normalizados)`
- Aplica weights de `risk_score_factors`
- Mapeia para level: 0-25 low / 26-50 medium / 51-75 high / 76-100 critical
- Grava em `user_risk_scores`; se delta > 2σ vs. score anterior → invoca `process-violation-alert` com tipo `ueba_anomaly`
- Mapeia anomalias detectadas para técnicas MITRE (regras: exfil clipboard → T1567, off-hours → T1078, etc.)

### `ueba-shadow-mode` (toggle)
- Flag `ueba_shadow_mode` em `app_config`: por 30 dias calcula scores mas não dispara alertas, apenas log
- Permite calibração antes de ir live

---

## 3. Algoritmo Half-Space Trees (TS puro)

`supabase/functions/_shared/halfSpaceTrees.ts`:
- Constrói N árvores binárias com splits aleatórios em features normalizadas [0,1]
- Score = profundidade média de isolamento; anomalia = score baixo
- Streaming: aceita window deslizante sem retreino
- ~200 linhas, sem deps; reutilizável por outras funções

---

## 4. Frontend — UI Admin

`src/pages/admin/ueba/`
- **`UEBADashboardPage.tsx`** (`/admin/ueba`) — heatmap de risk scores por funcionário, top 10 risky, distribuição por level
- **`EmployeeRiskProfilePage.tsx`** (`/admin/ueba/:employeeId`) — timeline de scores 30d, breakdown por feature/factor, técnicas MITRE detectadas, ações sugeridas
- **`UEBASettingsPage.tsx`** (`/admin/ueba/settings`) — toggle shadow mode, ajuste de weights por factor, threshold de alertas
- **`<RiskScoreBadge />`** — componente reutilizável (cor semântica + sparkline) usado em listagens de funcionários

Hooks novos:
- `useRiskScores(employeeId?)` — query + realtime subscription em `user_risk_scores`
- `useBehavioralBaseline(employeeId)` — fetch baseline + comparativo atual
- `useMitreTechniques()` — catálogo

i18n completo (pt-BR, en-US, es) para todas labels e MITRE descriptions.

---

## 5. Cron Jobs (pg_cron)

Via insert tool (não migration — contém URLs/anon key):
- `behavioral-baseline-builder`: diário 03:00 UTC
- `risk-score-calculator` (todos employees): a cada hora
- Cleanup `user_risk_scores` >90 dias: semanal

---

## 6. Integração com Sistemas Existentes

- **Dashboard principal**: novo widget "Top Risky Users" usando `<RiskScoreBadge />`
- **EmployeesPage**: coluna risk_score com badge + filtro por level (URL state)
- **Alert engine**: novo tipo `ueba_anomaly` com template pt-BR/en-US/es
- **Activity logs**: `risk_context` jsonb anexado a violações para investigação

---

## 7. Configuração & Performance

- `CONFIG.UEBA_BASELINE_DAYS = 30`, `CONFIG.UEBA_MIN_SAMPLES = 7`
- `CONFIG.UEBA_HST_TREES = 50`, `CONFIG.UEBA_HST_DEPTH = 8`
- Cálculo por employee <500ms (P95); batch 100 employees por invocação
- Circuit breaker para falhas de DB
- Logs estruturados com `risk_score_calc` event type

---

## 8. Compliance & Privacidade

- Risk scores **não** expõem PII; baseline armazena apenas estatísticas agregadas
- LGPD: titular pode solicitar export de seu próprio risk profile via DSAR (futuro Q3)
- Audit log de alterações em weights/thresholds (quem mudou, quando)

---

## 9. Entrega Faseada (dentro do épico)

| Sub-fase | Entregável |
|---|---|
| **A** | Schema + seed MITRE + `behavioral-baseline-builder` + cron |
| **B** | `risk-score-calculator` com Half-Space Trees + grava scores |
| **C** | UI Dashboard + EmployeeRiskProfile + RiskScoreBadge |
| **D** | Settings page + shadow mode + integração alert engine |
| **E** | Integração em EmployeesPage + Dashboard widget |

Implementação será sequencial A→E em uma única passagem.

---

## 10. Arquivos Criados/Modificados

**Novos (12):**
- `supabase/migrations/<timestamp>_ueba_baseline.sql`
- `supabase/functions/_shared/halfSpaceTrees.ts`
- `supabase/functions/behavioral-baseline-builder/index.ts`
- `supabase/functions/risk-score-calculator/index.ts`
- `src/pages/admin/ueba/UEBADashboardPage.tsx`
- `src/pages/admin/ueba/EmployeeRiskProfilePage.tsx`
- `src/pages/admin/ueba/UEBASettingsPage.tsx`
- `src/components/ueba/RiskScoreBadge.tsx`
- `src/hooks/useRiskScores.ts`
- `src/hooks/useBehavioralBaseline.ts`
- `src/hooks/useMitreTechniques.ts`
- `src/lib/uebaLevels.ts` (helpers de classificação + cores)

**Modificados (5):**
- `src/routes/AppRoutes.tsx` (3 rotas novas)
- `src/pages/EmployeesPage.tsx` (coluna risk + filtro)
- `src/pages/Dashboard.tsx` (widget)
- `supabase/config.toml` (3 functions)
- `src/lib/i18n.ts` (chaves UEBA + MITRE)

---

## Próximo Passo

Aprovar para iniciar pela sub-fase **A** (schema + baseline builder), seguindo sequencial até **E** sem interrupções, conforme preferência do usuário.
