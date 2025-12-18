-- Create geofences table for storing allowed locations
CREATE TABLE public.geofences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 100,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create employee_geofences junction table
CREATE TABLE public.employee_geofences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  geofence_id UUID NOT NULL REFERENCES public.geofences(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(employee_id, geofence_id)
);

-- Create geofence_violations table to log violations
CREATE TABLE public.geofence_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  device TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  detected_address TEXT,
  nearest_geofence_id UUID REFERENCES public.geofences(id),
  distance_meters INTEGER,
  action_taken TEXT DEFAULT 'alert',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_violations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for geofences
CREATE POLICY "Authenticated users can view geofences" 
ON public.geofences FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage geofences" 
ON public.geofences FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for employee_geofences
CREATE POLICY "Authenticated users can view employee_geofences" 
ON public.employee_geofences FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage employee_geofences" 
ON public.employee_geofences FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for geofence_violations
CREATE POLICY "Authenticated users can view geofence_violations" 
ON public.geofence_violations FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert geofence_violations" 
ON public.geofence_violations FOR INSERT 
WITH CHECK (true);

-- Update trigger for geofences
CREATE TRIGGER update_geofences_updated_at
BEFORE UPDATE ON public.geofences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for geofence_violations
ALTER PUBLICATION supabase_realtime ADD TABLE public.geofence_violations;