CREATE INDEX IF NOT EXISTS idx_edge_logs_function_created
  ON public.edge_function_logs (function_name, created_at DESC);
ANALYZE public.edge_function_logs;