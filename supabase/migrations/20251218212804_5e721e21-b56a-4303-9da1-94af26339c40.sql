-- Drop the problematic policy that queries auth.users directly
DROP POLICY IF EXISTS "Users can check own exemption" ON public.policy_exemptions;

-- Recreate the policy using auth.jwt() which is the correct way to access user metadata
CREATE POLICY "Users can check own exemption" 
ON public.policy_exemptions 
FOR SELECT 
USING (
  employee_name = (auth.jwt() ->> 'email')::text 
  OR employee_name = ((auth.jwt() -> 'user_metadata') ->> 'full_name')::text
);