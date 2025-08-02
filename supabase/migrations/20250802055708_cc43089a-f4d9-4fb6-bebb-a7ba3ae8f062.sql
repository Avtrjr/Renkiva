-- Add comprehensive storage policies to ensure full bucket access

-- Allow public to list objects in public buckets (needed for bucket discovery)
CREATE POLICY "Public can list objects in public buckets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN ('movies', 'meshtv-library'));

-- Allow authenticated users to list objects in all buckets they have access to
CREATE POLICY "Authenticated users can list objects in accessible buckets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id IN ('movies', 'meshtv-library') OR 
  (bucket_id = 'ad-assets' AND auth.uid()::text = (storage.foldername(name))[1])
);