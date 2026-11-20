-- Adjust geofences table
ALTER TABLE public.geofences 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('circle', 'polygon')) DEFAULT 'circle',
ADD COLUMN IF NOT EXISTS geometry JSONB,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS restricted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS points_count INTEGER DEFAULT 0;

-- Update existing records to circle if geometry is null
UPDATE public.geofences SET type = 'circle' WHERE geometry IS NULL;
UPDATE public.geofences SET type = 'polygon' WHERE geometry IS NOT NULL;
