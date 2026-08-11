-- Create table for policy exemptions
CREATE TABLE public.policy_exemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL UNIQUE,
  reason TEXT,
  exempted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.policy_exemptions ENABLE ROW LEVEL SECURITY;

-- Policies for admins
CREATE POLICY "Admins can view exemptions"
ON public.policy_exemptions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert exemptions"
ON public.policy_exemptions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update exemptions"
ON public.policy_exemptions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete exemptions"
ON public.policy_exemptions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to check their own exemption status
CREATE POLICY "Users can check own exemption"
ON public.policy_exemptions
FOR SELECT
TO authenticated
USING (employee_name = (SELECT email FROM auth.users WHERE id = auth.uid()) OR 
       employee_name = (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = auth.uid()));