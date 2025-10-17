-- Fix location privacy: reduce GPS precision from 8 decimals (~1.1mm) to 2 decimals (~1.1km)
-- This prevents individual tracking while maintaining useful analytics

-- Step 1: Reduce coordinate precision
ALTER TABLE view_stats 
  ALTER COLUMN location_lat TYPE numeric(4,2),
  ALTER COLUMN location_lng TYPE numeric(5,2);

-- Step 2: Require authentication for INSERT (currently allows anyone)
DROP POLICY IF EXISTS "Authenticated users can insert view stats" ON view_stats;
CREATE POLICY "Authenticated users can insert view stats" 
ON view_stats 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Step 3: Add retention policy comment (implement auto-deletion via pg_cron separately)
COMMENT ON TABLE view_stats IS 'Analytics data with 2-decimal coordinate precision (~1.1km). Recommended: Auto-delete entries older than 90 days for GDPR compliance.';

-- Step 4: Update existing data to match new precision
UPDATE view_stats 
SET 
  location_lat = ROUND(location_lat::numeric, 2),
  location_lng = ROUND(location_lng::numeric, 2)
WHERE location_lat IS NOT NULL OR location_lng IS NOT NULL;