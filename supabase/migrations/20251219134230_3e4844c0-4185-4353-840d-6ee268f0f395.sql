-- Create table for blocked IPs
CREATE TABLE public.blocked_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  reason TEXT,
  blocked_by UUID REFERENCES auth.users(id),
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  request_count_at_block INTEGER,
  endpoint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on active IP blocks
CREATE UNIQUE INDEX blocked_ips_active_ip_idx ON public.blocked_ips (ip_address) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Admins can view blocked IPs
CREATE POLICY "Admins can view blocked IPs"
ON public.blocked_ips
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert blocked IPs
CREATE POLICY "Admins can insert blocked IPs"
ON public.blocked_ips
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update blocked IPs
CREATE POLICY "Admins can update blocked IPs"
ON public.blocked_ips
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete blocked IPs
CREATE POLICY "Admins can delete blocked IPs"
ON public.blocked_ips
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to check if IP is blocked (for edge functions)
CREATE OR REPLACE FUNCTION public.is_ip_blocked(p_ip_address TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blocked_ips
    WHERE ip_address = p_ip_address
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;