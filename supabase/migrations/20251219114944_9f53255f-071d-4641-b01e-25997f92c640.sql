-- Allow admins to view rate limit logs
CREATE POLICY "Admins can view rate limit logs" 
ON public.rate_limit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));