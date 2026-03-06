-- Enable RLS on partitioned tables missing it
ALTER TABLE public.click_logs_partitioned_2026_04 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_logs_partitioned_2026_05 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keystroke_logs_partitioned_2026_04 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keystroke_logs_partitioned_2026_05 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_activity_logs_partitioned_2026_04 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_activity_logs_partitioned_2026_05 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_logs_partitioned_2026_04 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_logs_partitioned_2026_05 ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for click_logs partitions
CREATE POLICY "Admin access click_logs_2026_04" ON public.click_logs_partitioned_2026_04
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin access click_logs_2026_05" ON public.click_logs_partitioned_2026_05
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only policies for keystroke_logs partitions
CREATE POLICY "Admin access keystroke_logs_2026_04" ON public.keystroke_logs_partitioned_2026_04
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin access keystroke_logs_2026_05" ON public.keystroke_logs_partitioned_2026_05
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only policies for mobile_activity_logs partitions
CREATE POLICY "Admin access mobile_activity_2026_04" ON public.mobile_activity_logs_partitioned_2026_04
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin access mobile_activity_2026_05" ON public.mobile_activity_logs_partitioned_2026_05
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only policies for productivity_logs partitions
CREATE POLICY "Admin access productivity_2026_04" ON public.productivity_logs_partitioned_2026_04
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin access productivity_2026_05" ON public.productivity_logs_partitioned_2026_05
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
