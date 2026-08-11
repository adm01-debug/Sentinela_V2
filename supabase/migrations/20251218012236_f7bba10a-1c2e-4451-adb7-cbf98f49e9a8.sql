-- Add photo_url and location columns to policy_acknowledgments table
ALTER TABLE public.policy_acknowledgments 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_address TEXT;

-- Create storage bucket for acknowledgment photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('acknowledgment-photos', 'acknowledgment-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for uploading photos
CREATE POLICY "Allow authenticated uploads to acknowledgment-photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'acknowledgment-photos');

-- Create storage policy for public read access
CREATE POLICY "Allow public read access to acknowledgment-photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'acknowledgment-photos');