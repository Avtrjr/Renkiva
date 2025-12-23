-- Create table for rate limit violations
CREATE TABLE public.rate_limit_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  violation_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user activity logs
CREATE TABLE public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX idx_rate_limit_violations_user_id ON public.rate_limit_violations(user_id);
CREATE INDEX idx_rate_limit_violations_created_at ON public.rate_limit_violations(created_at DESC);
CREATE INDEX idx_rate_limit_violations_endpoint ON public.rate_limit_violations(endpoint);

CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_user_activity_logs_action ON public.user_activity_logs(action);

-- Enable RLS
ALTER TABLE public.rate_limit_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and moderators can view rate limit violations
CREATE POLICY "Admins can view rate limit violations"
ON public.rate_limit_violations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'moderator')
  )
);

-- Only admins can delete rate limit violations
CREATE POLICY "Admins can delete rate limit violations"
ON public.rate_limit_violations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- System can insert rate limit violations (via service role)
CREATE POLICY "Service role can insert rate limit violations"
ON public.rate_limit_violations
FOR INSERT
WITH CHECK (true);

-- Only admins and moderators can view activity logs
CREATE POLICY "Admins can view user activity logs"
ON public.user_activity_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'moderator')
  )
);

-- System can insert activity logs (via service role)
CREATE POLICY "Service role can insert activity logs"
ON public.user_activity_logs
FOR INSERT
WITH CHECK (true);

-- Create a view for admin dashboard stats
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.rate_limit_violations WHERE created_at > NOW() - INTERVAL '24 hours') as violations_24h,
  (SELECT COUNT(*) FROM public.user_activity_logs WHERE created_at > NOW() - INTERVAL '24 hours') as activity_24h,
  (SELECT COUNT(*) FROM public.shows) as total_shows,
  (SELECT COUNT(*) FROM public.mesh_nodes WHERE is_active = true) as active_nodes;