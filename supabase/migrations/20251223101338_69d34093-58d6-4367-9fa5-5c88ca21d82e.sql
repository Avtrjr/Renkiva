-- Add GDPR consent tracking columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_consent BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_export_requested_at TIMESTAMPTZ;

-- Create data retention automation function
CREATE OR REPLACE FUNCTION public.cleanup_old_location_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clear location from view_stats older than 90 days
  UPDATE view_stats 
  SET location_lat = NULL, location_lng = NULL 
  WHERE viewed_at < NOW() - INTERVAL '90 days'
    AND (location_lat IS NOT NULL OR location_lng IS NOT NULL);
  
  -- Clear old mesh_nodes location
  UPDATE mesh_nodes 
  SET latitude = NULL, longitude = NULL 
  WHERE last_seen < NOW() - INTERVAL '90 days'
    AND (latitude IS NOT NULL OR longitude IS NOT NULL);
    
  RAISE NOTICE 'Cleaned up location data older than 90 days';
END;
$$;