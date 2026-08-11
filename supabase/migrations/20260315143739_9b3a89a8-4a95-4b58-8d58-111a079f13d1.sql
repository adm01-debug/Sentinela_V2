
-- Fix overly permissive INSERT policies to require admin role
-- Drop and recreate with proper WITH CHECK

DROP POLICY IF EXISTS "Admins can insert agent keys" ON public.agent_keys;
CREATE POLICY "Admins can insert agent keys" ON public.agent_keys FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert employees" ON public.employees;
CREATE POLICY "Admins can insert employees" ON public.employees FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert devices" ON public.devices;
CREATE POLICY "Admins can insert devices" ON public.devices FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert geo blocks" ON public.geo_blocks;
CREATE POLICY "Admins can insert geo blocks" ON public.geo_blocks FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert blocked IPs" ON public.blocked_ips;
CREATE POLICY "Admins can insert blocked IPs" ON public.blocked_ips FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert app rules" ON public.application_rules;
CREATE POLICY "Admins can insert app rules" ON public.application_rules FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert alert settings" ON public.alert_notification_settings;
CREATE POLICY "Admins can insert alert settings" ON public.alert_notification_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert monitoring settings" ON public.monitoring_settings;
CREATE POLICY "Admins can insert monitoring settings" ON public.monitoring_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin can insert message templates" ON public.message_templates;
CREATE POLICY "Admin can insert message templates" ON public.message_templates FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert AI reports" ON public.ai_analysis_reports;
CREATE POLICY "Admins can insert AI reports" ON public.ai_analysis_reports FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
