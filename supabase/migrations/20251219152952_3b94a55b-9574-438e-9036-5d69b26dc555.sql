-- Create table for WhatsApp notification settings
CREATE TABLE public.whatsapp_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  phone_number_id TEXT,
  recipient_numbers TEXT[] DEFAULT '{}',
  notify_critical BOOLEAN NOT NULL DEFAULT true,
  notify_high BOOLEAN NOT NULL DEFAULT true,
  notify_medium BOOLEAN NOT NULL DEFAULT false,
  notify_low BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view whatsapp settings" 
ON public.whatsapp_notification_settings 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can insert whatsapp settings" 
ON public.whatsapp_notification_settings 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update whatsapp settings" 
ON public.whatsapp_notification_settings 
FOR UPDATE 
TO authenticated
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_whatsapp_notification_settings_updated_at
BEFORE UPDATE ON public.whatsapp_notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for WhatsApp message logs
CREATE TABLE public.whatsapp_message_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_number TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'alert',
  message_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  whatsapp_message_id TEXT,
  error_message TEXT,
  violation_id UUID REFERENCES public.security_violations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_message_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view whatsapp logs" 
ON public.whatsapp_message_logs 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Service can insert whatsapp logs" 
ON public.whatsapp_message_logs 
FOR INSERT 
TO authenticated
WITH CHECK (true);