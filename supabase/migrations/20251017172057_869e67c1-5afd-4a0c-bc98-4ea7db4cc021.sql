-- Fix view_stats location privacy by rounding coordinates
-- This reduces precision from exact GPS to ~1.1km granularity

-- Add comment explaining privacy protection
COMMENT ON COLUMN view_stats.location_lat IS 'Latitude rounded to 0.01° (~1.1km) for privacy';
COMMENT ON COLUMN view_stats.location_lng IS 'Longitude rounded to 0.01° (~1.1km) for privacy';

-- Update RLS policy to require authentication for INSERT
DROP POLICY IF EXISTS "Anyone can insert view stats" ON view_stats;

CREATE POLICY "Authenticated users can insert view stats"
ON view_stats
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add retention policy comment (implement with pg_cron or application logic)
COMMENT ON TABLE view_stats IS 'View statistics - consider implementing 90-day retention policy';

-- Update existing records to round coordinates (one-time migration)
UPDATE view_stats
SET 
  location_lat = ROUND(location_lat::numeric, 2),
  location_lng = ROUND(location_lng::numeric, 2)
WHERE location_lat IS NOT NULL OR location_lng IS NOT NULL;