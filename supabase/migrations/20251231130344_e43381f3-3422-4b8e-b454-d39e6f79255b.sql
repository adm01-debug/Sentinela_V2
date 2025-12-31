-- Create whitelisted IPs table
CREATE TABLE IF NOT EXISTS public.whitelisted_ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    bypass_rate_limit BOOLEAN NOT NULL DEFAULT true,
    bypass_auth BOOLEAN NOT NULL DEFAULT false,
    allowed_endpoints TEXT[] DEFAULT ARRAY[]::TEXT[],
    UNIQUE(ip_address)
);

-- Enable RLS
ALTER TABLE public.whitelisted_ips ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view whitelisted IPs"
ON public.whitelisted_ips FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert whitelisted IPs"
ON public.whitelisted_ips FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update whitelisted IPs"
ON public.whitelisted_ips FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete whitelisted IPs"
ON public.whitelisted_ips FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Function to check if IP is whitelisted
CREATE OR REPLACE FUNCTION public.is_ip_whitelisted(p_ip_address TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.whitelisted_ips
    WHERE ip_address = p_ip_address
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Function to check if IP can bypass rate limit
CREATE OR REPLACE FUNCTION public.ip_bypasses_rate_limit(p_ip_address TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.whitelisted_ips
    WHERE ip_address = p_ip_address
      AND is_active = true
      AND bypass_rate_limit = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Function to get whitelist info for an IP
CREATE OR REPLACE FUNCTION public.get_ip_whitelist_info(p_ip_address TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT jsonb_build_object(
      'is_whitelisted', true,
      'bypass_rate_limit', bypass_rate_limit,
      'bypass_auth', bypass_auth,
      'allowed_endpoints', allowed_endpoints,
      'expires_at', expires_at,
      'description', description
    )
    FROM public.whitelisted_ips
    WHERE ip_address = p_ip_address
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    LIMIT 1),
    jsonb_build_object('is_whitelisted', false)
  )
$$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_whitelisted_ips_ip ON public.whitelisted_ips(ip_address) WHERE is_active = true;