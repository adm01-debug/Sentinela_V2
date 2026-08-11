-- Drop the policy that references user_metadata (insecure)
DROP POLICY IF EXISTS "Users can check own exemption" ON public.policy_exemptions;

-- Recreate using only email from JWT (secure - can't be modified by user)
CREATE POLICY "Users can check own exemption" 
ON public.policy_exemptions 
FOR SELECT 
USING (
  employee_name = (auth.jwt() ->> 'email')::text
);