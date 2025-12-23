-- Drop the view with security definer issue
DROP VIEW IF EXISTS public.admin_dashboard_stats;

-- Recreate as a function instead (more secure)
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user is admin or moderator
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or moderator role required';
  END IF;

  RETURN json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'violations_24h', (SELECT COUNT(*) FROM public.rate_limit_violations WHERE created_at > NOW() - INTERVAL '24 hours'),
    'activity_24h', (SELECT COUNT(*) FROM public.user_activity_logs WHERE created_at > NOW() - INTERVAL '24 hours'),
    'total_shows', (SELECT COUNT(*) FROM public.shows),
    'active_nodes', (SELECT COUNT(*) FROM public.mesh_nodes WHERE is_active = true)
  );
END;
$$;