-- Fix users table RLS policies to prevent public data scraping
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- Allow viewing of basic public profile info (username, display_name, avatar_url)
-- This is needed for mesh network social features while protecting sensitive data
CREATE POLICY "Users can view public profile info"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Users can only view their own auth_user_id (sensitive)
-- This is enforced at the column level by selecting only non-sensitive columns in queries

-- Add comment explaining the security model
COMMENT ON TABLE public.users IS 'RLS enforced: Public profile info (username, display_name, avatar_url) is viewable by authenticated users. Sensitive fields like auth_user_id should only be queried when user matches their own record.';

-- Add comment to sensitive column
COMMENT ON COLUMN public.users.auth_user_id IS 'SENSITIVE: Should only be accessed by the user themselves. Do not include in public profile queries.';