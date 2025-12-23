-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule the cleanup job to run daily at 3 AM UTC
SELECT cron.schedule(
  'cleanup-location-data-daily',
  '0 3 * * *',
  $$SELECT public.cleanup_old_location_data();$$
);