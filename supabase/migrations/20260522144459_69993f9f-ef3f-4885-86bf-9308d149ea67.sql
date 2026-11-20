-- Create edge_function_logs table
CREATE TABLE IF NOT EXISTS public.edge_function_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_name TEXT NOT NULL,
    request_id TEXT NOT NULL,
    agent_key_id UUID REFERENCES public.agent_keys(id),
    employee_id UUID REFERENCES public.employees(id),
    company_id UUID, -- Not strictly enforced with FK if it comes from different sources, but recommended
    method TEXT,
    status INTEGER,
    duration_ms INTEGER,
    error_message TEXT,
    payload_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for performance
CREATE INDEX idx_edge_function_logs_company ON public.edge_function_logs(company_id);
CREATE INDEX idx_edge_function_logs_function ON public.edge_function_logs(function_name);
CREATE INDEX idx_edge_function_logs_created ON public.edge_function_logs(created_at);

-- Enable RLS
ALTER TABLE public.edge_function_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view their company logs" 
ON public.edge_function_logs 
FOR SELECT 
USING (
    company_id IN (
        SELECT company_id FROM public.user_companies WHERE user_id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Service role can do everything
-- Note: Service role bypasses RLS, so no specific policy needed for insertion from Edge Functions using service key.
