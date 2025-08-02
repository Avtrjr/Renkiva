-- Create mesh_fragments table for fragment metadata tracking
CREATE TABLE public.mesh_fragments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  fragment_hash TEXT NOT NULL,
  fragment_count INTEGER NOT NULL DEFAULT 0,
  total_size_mb NUMERIC NOT NULL DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mesh_fragments ENABLE ROW LEVEL SECURITY;

-- Create policies for mesh fragments
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

-- Add unique constraint for device_id and fragment_hash combination
ALTER TABLE public.mesh_fragments 
ADD CONSTRAINT unique_device_fragment 
UNIQUE (device_id, fragment_hash);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mesh_fragments_updated_at
BEFORE UPDATE ON public.mesh_fragments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();