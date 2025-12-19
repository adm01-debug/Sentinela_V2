-- Enable realtime for rate_limit_logs table
ALTER TABLE rate_limit_logs REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE rate_limit_logs;

-- Also enable for blocked_ips
ALTER TABLE blocked_ips REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE blocked_ips;