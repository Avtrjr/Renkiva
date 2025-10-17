-- Fix critical RLS security issues

-- 1. Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table (separate from profiles to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Fix sponsors table - require authentication for SELECT
DROP POLICY IF EXISTS "Authenticated users can view public sponsor info" ON public.sponsors;

CREATE POLICY "Authenticated users can view public sponsor info"
ON public.sponsors
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 5. Fix profiles table - require authentication
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 6. Fix mesh_fragments - require authentication
DROP POLICY IF EXISTS "Anyone can insert mesh fragments" ON public.mesh_fragments;
DROP POLICY IF EXISTS "Anyone can update mesh fragments" ON public.mesh_fragments;
DROP POLICY IF EXISTS "Anyone can view mesh fragments" ON public.mesh_fragments;

CREATE POLICY "Authenticated users can insert mesh fragments"
ON public.mesh_fragments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update mesh fragments"
ON public.mesh_fragments
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view mesh fragments"
ON public.mesh_fragments
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 7. Fix stream_fragments - require authentication
DROP POLICY IF EXISTS "Anyone can insert fragments" ON public.stream_fragments;
DROP POLICY IF EXISTS "Anyone can view fragments" ON public.stream_fragments;

CREATE POLICY "Authenticated users can insert fragments"
ON public.stream_fragments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view fragments"
ON public.stream_fragments
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 8. Fix mesh_streams - require authentication
DROP POLICY IF EXISTS "Anyone can insert streams" ON public.mesh_streams;
DROP POLICY IF EXISTS "Anyone can update streams" ON public.mesh_streams;
DROP POLICY IF EXISTS "Anyone can view streams" ON public.mesh_streams;

CREATE POLICY "Authenticated users can insert streams"
ON public.mesh_streams
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update streams"
ON public.mesh_streams
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view streams"
ON public.mesh_streams
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Add helpful comments
COMMENT ON TABLE public.user_roles IS 'Role-based access control. Roles are stored separately from profiles to prevent privilege escalation. Use has_role() function in RLS policies.';
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check user roles. Use in RLS policies to avoid recursion issues.';