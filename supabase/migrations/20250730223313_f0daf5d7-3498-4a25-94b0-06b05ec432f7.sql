-- Fix user profile creation and improve RLS policies

-- Create function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Also create a user record for internal use
  INSERT INTO public.users (auth_user_id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Improve content discovery with better policies
CREATE POLICY "Allow unauthenticated content discovery" 
ON public.shows 
FOR SELECT 
USING (is_public = true);

-- Allow users to create their own shows more easily
DROP POLICY IF EXISTS "Users can insert their own shows" ON public.shows;
CREATE POLICY "Users can insert their own shows" 
ON public.shows 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND created_by IN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  )) OR 
  (is_public = true AND created_by IS NULL)
);

-- Create a function for content discovery that simulates mesh network
CREATE OR REPLACE FUNCTION public.discover_nearby_content()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  thumbnail_url text,
  video_url text,
  duration_minutes integer,
  file_size_bytes bigint,
  distance_meters numeric,
  signal_strength integer,
  sender_node text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.description,
    s.category,
    s.thumbnail_url,
    s.video_url,
    s.duration_minutes,
    s.file_size_bytes,
    (random() * 1000)::numeric as distance_meters,
    (50 + (random() * 50))::integer as signal_strength,
    CASE 
      WHEN s.created_by IS NULL THEN 'Public Library'
      ELSE 'Node-' || substr(s.created_by::text, 1, 8)
    END as sender_node
  FROM public.shows s
  WHERE s.is_public = true
  ORDER BY distance_meters ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC policy for the discover function
GRANT EXECUTE ON FUNCTION public.discover_nearby_content() TO anon, authenticated;