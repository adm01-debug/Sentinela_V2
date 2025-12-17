
-- Create agent_keys table for managing desktop agent authentication
CREATE TABLE public.agent_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL,
  agent_key text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  employee_name text,
  device_name text,
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.agent_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can manage agent keys
CREATE POLICY "Admins can view agent keys"
ON public.agent_keys
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert agent keys"
ON public.agent_keys
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update agent keys"
ON public.agent_keys
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete agent keys"
ON public.agent_keys
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
