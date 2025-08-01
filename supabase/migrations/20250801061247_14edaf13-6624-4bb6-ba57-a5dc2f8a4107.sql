-- Create creators table
CREATE TABLE public.creators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  bio TEXT,
  logo_url TEXT,
  verified BOOLEAN DEFAULT false,
  revenue_enabled BOOLEAN DEFAULT false,
  license_type TEXT DEFAULT 'original',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sponsors table
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  contact_email TEXT,
  budget_total DECIMAL(10,2) DEFAULT 0,
  budget_remaining DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table (enhanced version of shows)
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Entertainment',
  tags TEXT[],
  thumbnail_url TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  file_size_bytes BIGINT,
  verified_creator_content BOOLEAN DEFAULT false,
  distribution_type TEXT DEFAULT 'public', -- 'public', 'private', 'channel'
  access_token TEXT,
  revenue_enabled BOOLEAN DEFAULT false,
  license_type TEXT DEFAULT 'original',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_campaigns table
CREATE TABLE public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  ad_video_url TEXT,
  ad_banner_url TEXT,
  format TEXT NOT NULL, -- 'video', 'banner', 'both'
  runtime_seconds INTEGER DEFAULT 10,
  budget_allocated DECIMAL(10,2) NOT NULL,
  cost_per_impression DECIMAL(6,4) DEFAULT 0.02,
  target_category TEXT,
  target_videos UUID[],
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'paused', 'completed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mesh_bundles table
CREATE TABLE public.mesh_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_name TEXT NOT NULL,
  sponsor_id UUID REFERENCES public.sponsors(id),
  video_ids UUID[] NOT NULL,
  ad_campaign_ids UUID[],
  bundle_size_mb INTEGER,
  ttl_hours INTEGER DEFAULT 24,
  geographic_focus TEXT,
  bundle_url TEXT,
  status TEXT DEFAULT 'building', -- 'building', 'ready', 'distributed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create view_stats table
CREATE TABLE public.view_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  ad_campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  device_fingerprint TEXT,
  viewer_node_id UUID,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  watched_duration_seconds INTEGER DEFAULT 0,
  ad_watched_duration_seconds INTEGER DEFAULT 0,
  offline_synced BOOLEAN DEFAULT false,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesh_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.view_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creators
CREATE POLICY "Users can manage their creator profile" ON public.creators
  FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = creators.user_id))
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = creators.user_id));

CREATE POLICY "Anyone can view verified creators" ON public.creators
  FOR SELECT USING (verified = true);

-- RLS Policies for sponsors
CREATE POLICY "Users can manage their sponsor profile" ON public.sponsors
  FOR ALL USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = sponsors.user_id))
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = sponsors.user_id));

-- RLS Policies for videos
CREATE POLICY "Creators can manage their videos" ON public.videos
  FOR ALL USING (auth.uid() IN (SELECT u.auth_user_id FROM users u JOIN creators c ON u.id = c.user_id WHERE c.id = videos.creator_id))
  WITH CHECK (auth.uid() IN (SELECT u.auth_user_id FROM users u JOIN creators c ON u.id = c.user_id WHERE c.id = videos.creator_id));

CREATE POLICY "Anyone can view public videos" ON public.videos
  FOR SELECT USING (distribution_type = 'public');

-- RLS Policies for ad_campaigns
CREATE POLICY "Sponsors can manage their campaigns" ON public.ad_campaigns
  FOR ALL USING (auth.uid() IN (SELECT u.auth_user_id FROM users u JOIN sponsors s ON u.id = s.user_id WHERE s.id = ad_campaigns.sponsor_id))
  WITH CHECK (auth.uid() IN (SELECT u.auth_user_id FROM users u JOIN sponsors s ON u.id = s.user_id WHERE s.id = ad_campaigns.sponsor_id));

-- RLS Policies for mesh_bundles
CREATE POLICY "Sponsors can view their bundles" ON public.mesh_bundles
  FOR SELECT USING (auth.uid() IN (SELECT u.auth_user_id FROM users u JOIN sponsors s ON u.id = s.user_id WHERE s.id = mesh_bundles.sponsor_id));

CREATE POLICY "Anyone can view ready bundles" ON public.mesh_bundles
  FOR SELECT USING (status = 'ready');

-- RLS Policies for view_stats
CREATE POLICY "Content owners can view their stats" ON public.view_stats
  FOR SELECT USING (
    auth.uid() IN (
      SELECT u.auth_user_id FROM users u 
      JOIN creators c ON u.id = c.user_id 
      JOIN videos v ON c.id = v.creator_id 
      WHERE v.id = view_stats.video_id
    )
    OR 
    auth.uid() IN (
      SELECT u.auth_user_id FROM users u 
      JOIN sponsors s ON u.id = s.user_id 
      JOIN ad_campaigns ac ON s.id = ac.sponsor_id 
      WHERE ac.id = view_stats.ad_campaign_id
    )
  );

CREATE POLICY "Anyone can insert view stats" ON public.view_stats
  FOR INSERT WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_creators_updated_at
  BEFORE UPDATE ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mesh_bundles_updated_at
  BEFORE UPDATE ON public.mesh_bundles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();