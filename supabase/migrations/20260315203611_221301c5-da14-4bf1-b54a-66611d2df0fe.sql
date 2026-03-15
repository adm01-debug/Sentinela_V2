
-- ============================================================
-- GAP 1: PROJECTS & TASKS
-- ============================================================
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  status TEXT NOT NULL DEFAULT 'active',
  client_name TEXT,
  budget_hours NUMERIC,
  start_date DATE,
  end_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES public.employees(id),
  estimated_hours NUMERIC,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- GAP 2 & 6: TIME CLOCK + HOURS TRACKING
-- ============================================================
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id),
  task_id UUID REFERENCES public.tasks(id),
  clock_in TIMESTAMPTZ NOT NULL DEFAULT now(),
  clock_out TIMESTAMPTZ,
  duration_minutes NUMERIC,
  break_minutes NUMERIC DEFAULT 0,
  notes TEXT,
  is_manual BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- GAP 3: STATUS BOARD (employee_status for real-time)
-- ============================================================
CREATE TABLE public.employee_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'offline',
  current_task TEXT,
  current_project TEXT,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  clock_in_at TIMESTAMPTZ,
  total_today_minutes NUMERIC DEFAULT 0,
  idle_minutes NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable realtime for status board
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_status;

-- ============================================================
-- GAP 4: TIMESHEETS
-- ============================================================
CREATE TABLE public.timesheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL DEFAULT 'weekly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours NUMERIC DEFAULT 0,
  regular_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  break_hours NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, period_start, period_end)
);

-- ============================================================
-- GAP 5: ATTENDANCE RECORDS
-- ============================================================
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  scheduled_start TIME,
  scheduled_end TIME,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present',
  late_minutes INTEGER DEFAULT 0,
  early_departure_minutes INTEGER DEFAULT 0,
  overtime_minutes INTEGER DEFAULT 0,
  total_worked_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Projects: authenticated can read, admin can write
CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Tasks: authenticated can read, admin can write
CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Time entries: authenticated can read, admin can write
CREATE POLICY "Authenticated users can view time_entries" ON public.time_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert time_entries" ON public.time_entries FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update time_entries" ON public.time_entries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete time_entries" ON public.time_entries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Employee status: authenticated can read, admin can write
CREATE POLICY "Authenticated users can view employee_status" ON public.employee_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert employee_status" ON public.employee_status FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update employee_status" ON public.employee_status FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete employee_status" ON public.employee_status FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Timesheets: authenticated can read, admin can write
CREATE POLICY "Authenticated users can view timesheets" ON public.timesheets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert timesheets" ON public.timesheets FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update timesheets" ON public.timesheets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete timesheets" ON public.timesheets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Attendance: authenticated can read, admin can write
CREATE POLICY "Authenticated users can view attendance" ON public.attendance_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert attendance" ON public.attendance_records FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update attendance" ON public.attendance_records FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete attendance" ON public.attendance_records FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_time_entries_employee ON public.time_entries(employee_id);
CREATE INDEX idx_time_entries_project ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_clock_in ON public.time_entries(clock_in);
CREATE INDEX idx_employee_status_status ON public.employee_status(status);
CREATE INDEX idx_timesheets_employee ON public.timesheets(employee_id);
CREATE INDEX idx_timesheets_period ON public.timesheets(period_start, period_end);
CREATE INDEX idx_attendance_employee_date ON public.attendance_records(employee_id, date);
CREATE INDEX idx_tasks_project ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to);
