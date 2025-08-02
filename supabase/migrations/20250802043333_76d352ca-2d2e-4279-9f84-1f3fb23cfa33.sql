-- Create mesh_channels table
CREATE TABLE public.mesh_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_private BOOLEAN DEFAULT true,
  encryption_key TEXT NOT NULL,
  device_limit INT DEFAULT 50
);

-- Enable Row Level Security
ALTER TABLE public.mesh_channels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mesh channels
CREATE POLICY "Channel owners can manage their channels" 
ON public.mesh_channels 
FOR ALL 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Anyone can view public channels" 
ON public.mesh_channels 
FOR SELECT 
USING (is_private = false);

-- Add indexes for performance
CREATE INDEX idx_mesh_channels_owner ON public.mesh_channels(owner_id);
CREATE INDEX idx_mesh_channels_name ON public.mesh_channels(channel_name);
CREATE INDEX idx_mesh_channels_private ON public.mesh_channels(is_private);