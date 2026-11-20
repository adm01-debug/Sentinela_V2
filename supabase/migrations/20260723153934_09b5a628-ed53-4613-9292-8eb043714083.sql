-- Índices de performance para o dashboard de métricas de contestação (SLA 72h).
-- Aceleram: (a) filtros por created_at no painel, (b) card de alertas em risco
-- (status IN pending/under_review), (c) cálculo de resolução por resolved_at.

CREATE INDEX IF NOT EXISTS idx_violation_disputes_created_at
  ON public.violation_disputes (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_violation_disputes_status_created_at
  ON public.violation_disputes (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_violation_disputes_resolved_at
  ON public.violation_disputes (resolved_at)
  WHERE resolved_at IS NOT NULL;

-- Índice parcial para o hook useDisputeSlaAlerts (só pending/under_review).
CREATE INDEX IF NOT EXISTS idx_violation_disputes_open_sla
  ON public.violation_disputes (created_at)
  WHERE status IN ('pending', 'under_review');

ANALYZE public.violation_disputes;