
DROP POLICY IF EXISTS "Service role can insert login events" ON public.login_security_events;
CREATE POLICY "Service role can insert login events"
ON public.login_security_events FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage challenges" ON public.webauthn_challenges;
CREATE POLICY "Service role can manage challenges"
ON public.webauthn_challenges FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can insert error reports" ON public.error_reports;
CREATE POLICY "Authenticated users can insert error reports"
ON public.error_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert telemetry" ON public.query_telemetry;
CREATE POLICY "Authenticated users can insert telemetry"
ON public.query_telemetry FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can request password reset" ON public.password_reset_requests;
CREATE POLICY "Anyone can request password reset"
ON public.password_reset_requests FOR INSERT TO anon, authenticated
WITH CHECK (user_email IS NOT NULL AND length(user_email) BETWEEN 3 AND 320 AND user_email LIKE '%_@_%');

DROP POLICY IF EXISTS "Allow public inserts for employee confirmations" ON public.policy_acknowledgments;
CREATE POLICY "Allow public inserts for employee confirmations"
ON public.policy_acknowledgments FOR INSERT TO anon, authenticated
WITH CHECK (employee_name IS NOT NULL AND length(employee_name) > 0);
