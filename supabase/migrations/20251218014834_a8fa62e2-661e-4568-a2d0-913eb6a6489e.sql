-- Create table for session recordings with screenshots and events
CREATE TABLE public.session_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  device TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  screenshot_url TEXT NOT NULL,
  app_name TEXT,
  window_title TEXT,
  events JSONB DEFAULT '[]'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view session recordings" 
ON public.session_recordings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert session recordings" 
ON public.session_recordings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete session recordings" 
ON public.session_recordings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient queries
CREATE INDEX idx_session_recordings_employee_date ON public.session_recordings (employee_name, session_date);
CREATE INDEX idx_session_recordings_recorded_at ON public.session_recordings (recorded_at DESC);

-- Enable realtime for live view
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_recordings;