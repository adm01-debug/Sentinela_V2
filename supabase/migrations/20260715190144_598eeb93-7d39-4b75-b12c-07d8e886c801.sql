
-- Fix 1: Restrict message_templates DELETE to admins only
DROP POLICY IF EXISTS "Users can delete message templates" ON public.message_templates;

CREATE POLICY "Only admins can delete message templates"
ON public.message_templates
FOR DELETE
TO authenticated
USING (
  is_default = false
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: Restrict acknowledgment-photos uploads to owner-scoped paths
-- Path convention: {auth.uid()}/... enforces per-user ownership
DROP POLICY IF EXISTS "Allow authenticated uploads to acknowledgment-photos" ON storage.objects;

CREATE POLICY "Users can upload own acknowledgment photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'acknowledgment-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own acknowledgment photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'acknowledgment-photos'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);
