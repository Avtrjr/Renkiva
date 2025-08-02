-- Add missing storage policies for bucket listing and basic access

-- Allow authenticated users to list all buckets
CREATE POLICY "Allow authenticated users to list buckets"
ON storage.buckets
FOR SELECT
TO authenticated
USING (true);

-- Allow public access to list public buckets
CREATE POLICY "Allow public to list public buckets"
ON storage.buckets
FOR SELECT
TO public
USING (public = true);

-- Ensure RLS is enabled on buckets table
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;