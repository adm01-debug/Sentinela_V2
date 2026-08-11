-- Create rate limiting table for tracking requests
CREATE TABLE public.rate_limit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  identifier_type TEXT NOT NULL, -- 'ip', 'agent_key', 'device_token'
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_rate_limit_identifier_endpoint ON public.rate_limit_logs (identifier, endpoint, window_start);

-- Create index for cleanup of old records
CREATE INDEX idx_rate_limit_window_start ON public.rate_limit_logs (window_start);

-- Enable RLS
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role only" ON public.rate_limit_logs
  FOR ALL
  USING (false);

-- Create function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_current_count INTEGER;
  v_result JSONB;
BEGIN
  -- Calculate window start
  v_window_start := now() - (p_window_seconds || ' seconds')::INTERVAL;
  
  -- Get current count in window
  SELECT COALESCE(SUM(request_count), 0)
  INTO v_current_count
  FROM rate_limit_logs
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND window_start >= v_window_start;
  
  -- Check if over limit
  IF v_current_count >= p_max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_count', v_current_count,
      'max_requests', p_max_requests,
      'retry_after_seconds', p_window_seconds
    );
  END IF;
  
  -- Insert new request log
  INSERT INTO rate_limit_logs (identifier, identifier_type, endpoint, request_count, window_start)
  VALUES (p_identifier, p_identifier_type, p_endpoint, 1, now());
  
  RETURN jsonb_build_object(
    'allowed', true,
    'current_count', v_current_count + 1,
    'max_requests', p_max_requests,
    'remaining', p_max_requests - (v_current_count + 1)
  );
END;
$$;

-- Create function to clean up old rate limit logs (call periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM rate_limit_logs
  WHERE window_start < now() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;