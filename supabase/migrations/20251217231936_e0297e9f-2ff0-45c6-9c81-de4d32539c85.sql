
-- Create table for complete click tracking
CREATE TABLE public.click_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  device text,
  app_name text,
  window_title text,
  click_type text NOT NULL DEFAULT 'left', -- left, right, middle, double
  x_position integer,
  y_position integer,
  target_element text,
  url text,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for complete keystroke tracking (individual keys)
CREATE TABLE public.keystroke_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  device text,
  app_name text,
  window_title text,
  key_pressed text NOT NULL,
  key_code integer,
  modifiers text[], -- shift, ctrl, alt, meta
  is_sensitive boolean DEFAULT false, -- flag for password fields etc
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for internet access control
CREATE TABLE public.internet_access_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL UNIQUE,
  access_level text NOT NULL DEFAULT 'full' CHECK (access_level IN ('restricted', 'partial', 'full')),
  allowed_sites text[] DEFAULT '{}',
  blocked_sites text[] DEFAULT '{}',
  allowed_categories text[] DEFAULT '{}',
  blocked_categories text[] DEFAULT '{}',
  bandwidth_limit_mbps integer,
  active_hours_start time,
  active_hours_end time,
  notes text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for AI analysis reports
CREATE TABLE public.ai_analysis_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text,
  report_type text NOT NULL, -- individual, team, general
  analysis_period_start timestamp with time zone,
  analysis_period_end timestamp with time zone,
  summary text,
  risk_score integer,
  recommendations jsonb,
  insights jsonb,
  raw_data jsonb,
  generated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.click_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keystroke_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internet_access_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for click_logs
CREATE POLICY "Admins can view click logs" ON public.click_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert click logs" ON public.click_logs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for keystroke_details
CREATE POLICY "Admins can view keystroke details" ON public.keystroke_details FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert keystroke details" ON public.keystroke_details FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for internet_access_settings
CREATE POLICY "Admins can view internet settings" ON public.internet_access_settings FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage internet settings" ON public.internet_access_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for ai_analysis_reports
CREATE POLICY "Admins can view AI reports" ON public.ai_analysis_reports FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert AI reports" ON public.ai_analysis_reports FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete AI reports" ON public.ai_analysis_reports FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_click_logs_employee ON public.click_logs(employee_name);
CREATE INDEX idx_click_logs_recorded ON public.click_logs(recorded_at);
CREATE INDEX idx_keystroke_details_employee ON public.keystroke_details(employee_name);
CREATE INDEX idx_keystroke_details_recorded ON public.keystroke_details(recorded_at);

-- Trigger for internet_access_settings updated_at
CREATE TRIGGER update_internet_access_settings_updated_at
BEFORE UPDATE ON public.internet_access_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
