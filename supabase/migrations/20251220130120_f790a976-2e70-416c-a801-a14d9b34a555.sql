-- Security Fix 1: Restrict geofence_violations SELECT to admins only
DROP POLICY IF EXISTS "Authenticated users can view geofence_violations" ON public.geofence_violations;
DROP POLICY IF EXISTS "Anyone can insert geofence_violations" ON public.geofence_violations;

CREATE POLICY "Admins can view geofence violations"
ON public.geofence_violations FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert geofence violations"
ON public.geofence_violations FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Security Fix 2: Restrict mobile_activity_logs INSERT to admins only  
DROP POLICY IF EXISTS "Anyone can insert mobile activity logs" ON public.mobile_activity_logs;

CREATE POLICY "Admins can insert mobile activity logs"
ON public.mobile_activity_logs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Security Fix 3: Fix handle_new_user to grant 'user' role by default instead of 'admin'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Grant 'user' role by default, NOT 'admin'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Security Fix 4: Make acknowledgment-photos bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'acknowledgment-photos';

-- Add admin-only SELECT policy for acknowledgment photos
CREATE POLICY "Admins can view acknowledgment photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'acknowledgment-photos' AND has_role(auth.uid(), 'admin'::app_role));