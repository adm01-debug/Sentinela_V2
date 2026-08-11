
-- ============================================================
-- FIX: Remove USING(true) SELECT policies, scope to company/admin
-- ============================================================

-- attendance_records: scope via employee.company_id
DROP POLICY IF EXISTS "Authenticated users can view attendance" ON public.attendance_records;
CREATE POLICY "View attendance in own company"
ON public.attendance_records FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = attendance_records.employee_id
      AND e.company_id = get_user_company_id(auth.uid())
  )
);

-- time_entries
DROP POLICY IF EXISTS "Authenticated users can view time_entries" ON public.time_entries;
CREATE POLICY "View time_entries in own company"
ON public.time_entries FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = time_entries.employee_id
      AND e.company_id = get_user_company_id(auth.uid())
  )
);

-- timesheets
DROP POLICY IF EXISTS "Authenticated users can view timesheets" ON public.timesheets;
CREATE POLICY "View timesheets in own company"
ON public.timesheets FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = timesheets.employee_id
      AND e.company_id = get_user_company_id(auth.uid())
  )
);

-- employee_status
DROP POLICY IF EXISTS "Authenticated users can view employee_status" ON public.employee_status;
CREATE POLICY "View employee_status in own company"
ON public.employee_status FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_status.employee_id
      AND e.company_id = get_user_company_id(auth.uid())
  )
);

-- employee_geofences
DROP POLICY IF EXISTS "Authenticated users can view employee_geofences" ON public.employee_geofences;
CREATE POLICY "View employee_geofences in own company"
ON public.employee_geofences FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_geofences.employee_id
      AND e.company_id = get_user_company_id(auth.uid())
  )
);

-- tasks: scope via project.company_id
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
CREATE POLICY "View tasks in own company"
ON public.tasks FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = tasks.project_id
      AND p.company_id = get_user_company_id(auth.uid())
  )
);

-- projects
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
CREATE POLICY "View projects in own company"
ON public.projects FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR company_id = get_user_company_id(auth.uid())
);

-- geofences: drop duplicate unrestricted policy
DROP POLICY IF EXISTS "Authenticated users can view geofences" ON public.geofences;

-- whatsapp_message_logs: admin only
DROP POLICY IF EXISTS "Users can view whatsapp logs" ON public.whatsapp_message_logs;
CREATE POLICY "Admins can view whatsapp logs"
ON public.whatsapp_message_logs FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- whatsapp_notification_settings: admin only
DROP POLICY IF EXISTS "Users can view whatsapp settings" ON public.whatsapp_notification_settings;
CREATE POLICY "Admins can view whatsapp settings"
ON public.whatsapp_notification_settings FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- message_templates: admin only
DROP POLICY IF EXISTS "Users can view message templates" ON public.message_templates;
CREATE POLICY "Admins can view message templates"
ON public.message_templates FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- query_telemetry: admin only
DROP POLICY IF EXISTS "Authenticated users can read telemetry" ON public.query_telemetry;
CREATE POLICY "Admins can read telemetry"
ON public.query_telemetry FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- STORAGE: harden bucket policies
-- ============================================================

-- Remove public read access to acknowledgment photos
DROP POLICY IF EXISTS "Allow public read access to acknowledgment-photos" ON storage.objects;

-- Restrict violation-screenshots writes to service_role only
DROP POLICY IF EXISTS "Service role can upload violation screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete violation screenshots" ON storage.objects;

CREATE POLICY "service_role uploads violation screenshots"
ON storage.objects FOR INSERT TO service_role
WITH CHECK (bucket_id = 'violation-screenshots');

CREATE POLICY "service_role deletes violation screenshots"
ON storage.objects FOR DELETE TO service_role
USING (bucket_id = 'violation-screenshots');
