-- Modify the existing mesh_fragments table to match the optimized structure
-- First, drop the existing table since we need to change column types
DROP TABLE IF EXISTS public.mesh_fragments CASCADE;

-- Create the optimized mesh_fragments table
CREATE TABLE public.mesh_fragments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  fragment_hash TEXT NOT NULL,
  fragment_count INT DEFAULT 0,
  total_size_mb FLOAT DEFAULT 0,
  last_seen TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_fragment_per_device UNIQUE(device_id, fragment_hash)
);

-- Enable Row Level Security
ALTER TABLE public.mesh_fragments ENABLE ROW LEVEL SECURITY;

-- Create optimized RLS policies
CREATE POLICY "Anyone can view mesh fragments" 
ON public.mesh_fragments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert mesh fragments" 
ON public.mesh_fragments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update mesh fragments" 
ON public.mesh_fragments 
FOR UPDATE 
USING (true);

-- Add performance indexes for faster mesh diagnostics
CREATE INDEX idx_mesh_fragments_title ON public.mesh_fragments(video_title);
CREATE INDEX idx_mesh_fragments_last_seen ON public.mesh_fragments(last_seen DESC);
CREATE INDEX idx_mesh_fragments_device_id ON public.mesh_fragments(device_id);
CREATE INDEX idx_mesh_fragments_hash ON public.mesh_fragments(fragment_hash);