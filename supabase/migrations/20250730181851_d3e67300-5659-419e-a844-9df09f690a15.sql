-- Create storage bucket for ad assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-assets',
  'ad-assets',
  false,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create ad_assets table
CREATE TABLE public.ad_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'image')),
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_impressions table for tracking views
CREATE TABLE public.ad_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_asset_id UUID NOT NULL REFERENCES public.ad_assets(id) ON DELETE CASCADE,
  viewer_node_id UUID REFERENCES public.mesh_nodes(id),
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_fingerprint TEXT,
  duration_seconds INTEGER DEFAULT 0
);

-- Enable RLS on ad_assets
ALTER TABLE public.ad_assets ENABLE ROW LEVEL SECURITY;

-- RLS policies for ad_assets
CREATE POLICY "Users can view all approved ads" 
ON public.ad_assets 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Users can manage their own ad assets" 
ON public.ad_assets 
FOR ALL 
USING (auth.uid() IN (SELECT users.auth_user_id FROM users WHERE users.id = ad_assets.uploaded_by));

-- Enable RLS on ad_impressions
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

-- RLS policies for ad_impressions
CREATE POLICY "Anyone can insert ad impressions" 
ON public.ad_impressions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Ad owners can view impressions for their ads" 
ON public.ad_impressions 
FOR SELECT 
USING (auth.uid() IN (
  SELECT users.auth_user_id 
  FROM users 
  JOIN ad_assets ON ad_assets.uploaded_by = users.id 
  WHERE ad_assets.id = ad_impressions.ad_asset_id
));

-- Storage policies for ad-assets bucket
CREATE POLICY "Authenticated users can upload ad assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'ad-assets' AND 
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own ad assets" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'ad-assets' AND 
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Approved ads are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'ad-assets' AND 
  EXISTS (
    SELECT 1 FROM public.ad_assets 
    WHERE storage_path = name AND status = 'approved'
  )
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_ad_assets_updated_at
  BEFORE UPDATE ON public.ad_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get sponsor statistics
CREATE OR REPLACE FUNCTION public.get_sponsor_stats(sponsor_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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