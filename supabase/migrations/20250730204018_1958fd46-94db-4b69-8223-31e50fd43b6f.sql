-- Create storage bucket for movies
INSERT INTO storage.buckets (id, name, public) VALUES ('movies', 'movies', true);

-- Create storage policies for movie uploads
CREATE POLICY "Public movie access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'movies');

CREATE POLICY "Service role can upload movies" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'movies');