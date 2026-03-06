-- Fix overly permissive RLS policies - restrict to admin only

-- 1. geofences: replace USING(true) with admin check
DROP POLICY IF EXISTS "Authenticated users can manage geofences" ON public.geofences;
CREATE POLICY "Admin can manage geofences" ON public.geofences
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. employee_geofences: replace USING(true) with admin check
DROP POLICY IF EXISTS "Authenticated users can manage employee_geofences" ON public.employee_geofences;
CREATE POLICY "Admin can manage employee_geofences" ON public.employee_geofences
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. message_templates: restrict insert/update to admin
DROP POLICY IF EXISTS "Users can insert message templates" ON public.message_templates;
DROP POLICY IF EXISTS "Users can update message templates" ON public.message_templates;
CREATE POLICY "Admin can insert message templates" ON public.message_templates
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update message templates" ON public.message_templates
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. whatsapp_notification_settings: restrict to admin
DROP POLICY IF EXISTS "Users can insert whatsapp settings" ON public.whatsapp_notification_settings;
DROP POLICY IF EXISTS "Users can update whatsapp settings" ON public.whatsapp_notification_settings;
CREATE POLICY "Admin can insert whatsapp settings" ON public.whatsapp_notification_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update whatsapp settings" ON public.whatsapp_notification_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. whatsapp_message_logs: restrict insert to admin
DROP POLICY IF EXISTS "Service can insert whatsapp logs" ON public.whatsapp_message_logs;
CREATE POLICY "Admin can insert whatsapp logs" ON public.whatsapp_message_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
