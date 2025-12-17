
-- Add screenshot_url column to security_violations
ALTER TABLE public.security_violations 
ADD COLUMN IF NOT EXISTS screenshot_url text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS notified_employee boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notified_admin boolean DEFAULT false;

-- Create storage bucket for violation screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('violation-screenshots', 'violation-screenshots', false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for violation screenshots bucket
CREATE POLICY "Admins can view violation screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'violation-screenshots' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can upload violation screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'violation-screenshots');

CREATE POLICY "Service role can delete violation screenshots"
ON storage.objects FOR DELETE
USING (bucket_id = 'violation-screenshots');
