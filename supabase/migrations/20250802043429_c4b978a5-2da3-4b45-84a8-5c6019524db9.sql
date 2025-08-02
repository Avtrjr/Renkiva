-- Create mesh_channel_invites table
CREATE TABLE public.mesh_channel_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.mesh_channels(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  used_by TEXT[] DEFAULT '{}', -- array of device_ids
  max_uses INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mesh_channel_invites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mesh channel invites
CREATE POLICY "Channel owners can manage invites for their channels" 
ON public.mesh_channel_invites 
FOR ALL 
USING (
  channel_id IN (
    SELECT id FROM public.mesh_channels 
    WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  channel_id IN (
    SELECT id FROM public.mesh_channels 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view non-expired invites" 
ON public.mesh_channel_invites 
FOR SELECT 
USING (
  (expires_at IS NULL OR expires_at > now()) 
  AND array_length(used_by, 1) < max_uses
);

-- Add performance indexes
CREATE INDEX idx_mesh_invites_channel ON public.mesh_channel_invites(channel_id);
CREATE INDEX idx_mesh_invites_code ON public.mesh_channel_invites(invite_code);
CREATE INDEX idx_mesh_invites_expires ON public.mesh_channel_invites(expires_at);
CREATE INDEX idx_mesh_invites_used_count ON public.mesh_channel_invites(array_length(used_by, 1));

-- Add constraint to ensure max_uses is positive
ALTER TABLE public.mesh_channel_invites 
ADD CONSTRAINT positive_max_uses CHECK (max_uses > 0);