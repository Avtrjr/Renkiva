-- Fix the security warning by adding proper search_path to the function
DROP FUNCTION IF EXISTS public.get_sponsor_stats(UUID);

CREATE OR REPLACE FUNCTION public.get_sponsor_stats(sponsor_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_views INTEGER;
  unique_devices INTEGER;
  estimated_revenue DECIMAL;
BEGIN
  -- Get total views for sponsor's ads
  SELECT COALESCE(COUNT(*), 0) INTO total_views
  FROM ad_impressions ai
  JOIN ad_assets aa ON ai.ad_asset_id = aa.id
  WHERE aa.uploaded_by = sponsor_user_id
  AND ai.viewed_at >= date_trunc('month', CURRENT_DATE);
  
  -- Get unique devices reached
  SELECT COALESCE(COUNT(DISTINCT COALESCE(ai.viewer_node_id, ai.device_fingerprint)), 0) INTO unique_devices
  FROM ad_impressions ai
  JOIN ad_assets aa ON ai.ad_asset_id = aa.id
  WHERE aa.uploaded_by = sponsor_user_id
  AND ai.viewed_at >= date_trunc('month', CURRENT_DATE);
  
  -- Calculate estimated revenue (simple formula: $0.01 per view)
  estimated_revenue := total_views * 0.01;
  
  RETURN json_build_object(
    'views', total_views,
    'devices', unique_devices,
    'estimatedRevenue', estimated_revenue
  );
END;
$$;