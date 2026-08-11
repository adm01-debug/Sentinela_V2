
-- Create enum for violation rule types
DO $$ BEGIN
  CREATE TYPE violation_rule_type AS ENUM ('blocked_site', 'blocked_keyword', 'blocked_app', 'blocked_file_extension', 'work_hours');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create violation rules table
CREATE TABLE public.violation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type violation_rule_type NOT NULL,
  rule_value text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active boolean NOT NULL DEFAULT true,
  notify_employee boolean NOT NULL DEFAULT true,
  notify_admin boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.violation_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view violation rules"
ON public.violation_rules FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert violation rules"
ON public.violation_rules FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update violation rules"
ON public.violation_rules FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete violation rules"
ON public.violation_rules FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_violation_rules_updated_at
BEFORE UPDATE ON public.violation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
