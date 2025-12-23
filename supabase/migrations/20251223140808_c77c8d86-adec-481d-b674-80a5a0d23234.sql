-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add cron job for cleaning up old view stats (runs daily at 3:15 AM UTC)
SELECT cron.schedule(
  'cleanup-view-stats-daily',
  '15 3 * * *',
  'SELECT public.cleanup_old_view_stats();'
);