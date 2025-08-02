-- Create storage policies for existing buckets

-- Policies for ad-assets bucket (private bucket for sponsor ads)
CREATE POLICY "Users can upload to ad-assets bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'ad-assets' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view their own ad-assets" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'ad-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own ad-assets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'ad-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own ad-assets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'ad-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for movies bucket (public bucket)
CREATE POLICY "Anyone can view movies" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'movies');

CREATE POLICY "Authenticated users can upload movies" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'movies' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own movies" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'movies' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own movies" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'movies' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for meshtv-library bucket (public bucket)
CREATE POLICY "Anyone can view meshtv-library" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'meshtv-library');

CREATE POLICY "Authenticated users can upload to meshtv-library" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'meshtv-library' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own meshtv-library files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'meshtv-library' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own meshtv-library files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'meshtv-library' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);