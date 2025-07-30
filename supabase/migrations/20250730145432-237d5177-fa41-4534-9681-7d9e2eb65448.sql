-- Add policy to allow anonymous users to insert public content through content discovery
CREATE POLICY "Allow public content discovery inserts" 
ON public.shows 
FOR INSERT 
WITH CHECK (is_public = true AND created_by IS NULL);

-- Update the existing insert policy to be more specific
DROP POLICY IF EXISTS "Users can insert their own shows" ON public.shows;
CREATE POLICY "Users can insert their own shows" 
ON public.shows 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() IN (
  SELECT users.auth_user_id 
  FROM users 
  WHERE users.id = shows.created_by
));