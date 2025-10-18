-- Create data retention cleanup function for GDPR compliance
-- Automatically deletes view_stats older than 90 days

CREATE OR REPLACE FUNCTION public.cleanup_old_view_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.view_stats 
  WHERE viewed_at < NOW() - INTERVAL '90 days';
  
  RAISE NOTICE 'Cleaned up view_stats older than 90 days';
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_view_stats() IS 'GDPR compliance: Removes location tracking data older than 90 days';

-- Create a scheduled job trigger (optional - can be called manually or via cron)
-- To run this automatically, set up pg_cron or call it from an edge function on a schedule