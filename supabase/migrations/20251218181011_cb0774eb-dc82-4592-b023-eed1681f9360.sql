-- Create table for alert notification settings
CREATE TABLE public.alert_notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_type text NOT NULL DEFAULT 'violation_alerts',
  recipient_emails text[] NOT NULL DEFAULT '{}',
  notify_critical boolean NOT NULL DEFAULT true,
  notify_high boolean NOT NULL DEFAULT true,
  notify_medium boolean NOT NULL DEFAULT false,
  notify_low boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(setting_type)
);

-- Enable RLS
ALTER TABLE public.alert_notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view alert settings" 
ON public.alert_notification_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert alert settings" 
ON public.alert_notification_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update alert settings" 
ON public.alert_notification_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete alert settings" 
ON public.alert_notification_settings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.alert_notification_settings (setting_type, recipient_emails, notify_critical, notify_high)
VALUES ('violation_alerts', '{}', true, true);