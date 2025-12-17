-- Enable realtime for keystroke_details and click_logs tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.keystroke_details;
ALTER PUBLICATION supabase_realtime ADD TABLE public.click_logs;