-- Add delete policy for application_rules
CREATE POLICY "Admins can delete app rules" 
ON public.application_rules 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));