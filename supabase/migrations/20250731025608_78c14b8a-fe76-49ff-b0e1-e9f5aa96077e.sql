-- Create the meshtv-library storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('meshtv-library', 'meshtv-library', true);

-- Create policies for meshtv-library bucket
CREATE POLICY "Anyone can view meshtv library files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'meshtv-library');

CREATE POLICY "Authenticated users can upload to meshtv library" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'meshtv-library' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own meshtv library files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'meshtv-library' AND auth.uid() IS NOT NULL);

-- Create storage usage tracking table
CREATE TABLE public.storage_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_name TEXT NOT NULL,
  total_files INTEGER DEFAULT 0,
  total_size_bytes BIGINT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.storage_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for storage usage (readable by authenticated users)
CREATE POLICY "Authenticated users can view storage usage" 
ON public.storage_usage 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Function to calculate storage usage
CREATE OR REPLACE FUNCTION public.calculate_storage_usage()
RETURNS TABLE(bucket_name TEXT, file_count BIGINT, total_size BIGINT)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    bucket_id as bucket_name,
    COUNT(*) as file_count,
    COALESCE(SUM((metadata->>'size')::bigint), 0) as total_size
  FROM storage.objects 
  WHERE bucket_id IN ('meshtv-library', 'movies', 'ad-assets')
  GROUP BY bucket_id;
$$;