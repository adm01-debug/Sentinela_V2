-- Scheduled Reports Settings
CREATE TABLE public.scheduled_report_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL DEFAULT 'daily', -- daily, weekly
  enabled BOOLEAN NOT NULL DEFAULT false,
  recipient_emails TEXT[] NOT NULL DEFAULT '{}',
  send_time TIME NOT NULL DEFAULT '08:00:00',
  send_day_of_week INTEGER DEFAULT 1, -- 1=Monday, for weekly reports
  include_violations BOOLEAN NOT NULL DEFAULT true,
  include_productivity BOOLEAN NOT NULL DEFAULT true,
  include_activity_summary BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.scheduled_report_settings ENABLE ROW LEVEL SECURITY;

-- Policies for admin access
CREATE POLICY "Admins can view scheduled report settings" 
ON public.scheduled_report_settings 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage scheduled report settings" 
ON public.scheduled_report_settings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Update trigger
CREATE TRIGGER update_scheduled_report_settings_updated_at
BEFORE UPDATE ON public.scheduled_report_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Mobile device registrations
CREATE TABLE public.mobile_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  device_id TEXT NOT NULL UNIQUE,
  device_model TEXT,
  os_type TEXT NOT NULL, -- android, ios
  os_version TEXT,
  app_version TEXT,
  push_token TEXT,
  last_location_lat DECIMAL(10, 8),
  last_location_lng DECIMAL(11, 8),
  last_seen_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mobile_devices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view mobile devices" 
ON public.mobile_devices 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage mobile devices" 
ON public.mobile_devices 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Mobile activity logs
CREATE TABLE public.mobile_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES public.mobile_devices(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- app_usage, location, screen_time
  app_name TEXT,
  duration_seconds INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  metadata JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mobile_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view mobile activity logs" 
ON public.mobile_activity_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert mobile activity logs" 
ON public.mobile_activity_logs 
FOR INSERT 
WITH CHECK (true);

-- Update trigger for mobile devices
CREATE TRIGGER update_mobile_devices_updated_at
BEFORE UPDATE ON public.mobile_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for mobile activity
ALTER PUBLICATION supabase_realtime ADD TABLE public.mobile_activity_logs;