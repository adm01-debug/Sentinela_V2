-- Enable realtime for mobile_devices table
ALTER TABLE public.mobile_devices REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.mobile_devices;