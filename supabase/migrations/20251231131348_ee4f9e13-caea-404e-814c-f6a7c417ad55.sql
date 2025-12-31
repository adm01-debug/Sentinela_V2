-- Create table for password reset requests with approval workflow
CREATE TABLE public.password_reset_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewer_notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Policies: Admins can manage all requests
CREATE POLICY "Admins can view password reset requests"
ON public.password_reset_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update password reset requests"
ON public.password_reset_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete password reset requests"
ON public.password_reset_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public insert for unauthenticated users requesting reset
CREATE POLICY "Anyone can request password reset"
ON public.password_reset_requests
FOR INSERT
WITH CHECK (true);

-- Add index for efficient querying
CREATE INDEX idx_password_reset_status ON public.password_reset_requests(status);
CREATE INDEX idx_password_reset_email ON public.password_reset_requests(user_email);