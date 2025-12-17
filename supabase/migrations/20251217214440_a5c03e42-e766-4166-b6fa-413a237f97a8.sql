-- Create settings_audit_log table
CREATE TABLE public.settings_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can view audit log"
ON public.settings_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert audit log"
ON public.settings_audit_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));