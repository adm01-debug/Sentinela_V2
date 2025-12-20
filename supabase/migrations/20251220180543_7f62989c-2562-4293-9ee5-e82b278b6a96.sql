-- Create devices table for device management
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'desktop',
  ip_address TEXT,
  mac_address TEXT,
  os_name TEXT,
  os_version TEXT,
  agent_version TEXT,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view devices"
ON public.devices FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert devices"
ON public.devices FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update devices"
ON public.devices FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete devices"
ON public.devices FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_devices_employee_id ON public.devices(employee_id);
CREATE INDEX idx_devices_company_id ON public.devices(company_id);
CREATE INDEX idx_devices_last_seen ON public.devices(last_seen DESC);
CREATE INDEX idx_devices_is_active ON public.devices(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_devices_updated_at
BEFORE UPDATE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();