-- Create work_schedules table for schedule templates
CREATE TABLE public.work_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  work_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  lunch_start TIME,
  lunch_end TIME,
  allow_overtime BOOLEAN NOT NULL DEFAULT false,
  auto_block_enabled BOOLEAN NOT NULL DEFAULT true,
  grace_period_minutes INTEGER NOT NULL DEFAULT 5,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_schedules junction table
CREATE TABLE public.employee_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.work_schedules(id) ON DELETE CASCADE,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_until DATE,
  assigned_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, schedule_id, effective_from)
);

-- Create overtime_requests table for extra time requests
CREATE TABLE public.overtime_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create station_blocks log table
CREATE TABLE public.station_block_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  device TEXT,
  block_type TEXT NOT NULL, -- 'auto_blocked', 'manual_blocked', 'unblocked'
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unblocked_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_block_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_schedules
CREATE POLICY "Admins can view work schedules" ON public.work_schedules FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert work schedules" ON public.work_schedules FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update work schedules" ON public.work_schedules FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete work schedules" ON public.work_schedules FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for employee_schedules
CREATE POLICY "Admins can view employee schedules" ON public.employee_schedules FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert employee schedules" ON public.employee_schedules FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update employee schedules" ON public.employee_schedules FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete employee schedules" ON public.employee_schedules FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for overtime_requests
CREATE POLICY "Admins can view overtime requests" ON public.overtime_requests FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert overtime requests" ON public.overtime_requests FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update overtime requests" ON public.overtime_requests FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete overtime requests" ON public.overtime_requests FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for station_block_logs
CREATE POLICY "Admins can view station block logs" ON public.station_block_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert station block logs" ON public.station_block_logs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_work_schedules_updated_at
  BEFORE UPDATE ON public.work_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();