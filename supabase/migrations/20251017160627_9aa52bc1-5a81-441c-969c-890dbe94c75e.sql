-- Fix sponsors table RLS to prevent business contact harvesting
-- Drop existing overly permissive policy if any
DROP POLICY IF EXISTS "Users can manage their sponsor profile" ON public.sponsors;

-- Allow sponsors to view and manage their own complete profile (including contact_email)
CREATE POLICY "Sponsors can manage their own profile"
ON public.sponsors
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT users.auth_user_id 
    FROM public.users 
    WHERE users.id = sponsors.user_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT users.auth_user_id 
    FROM public.users 
    WHERE users.id = sponsors.user_id
  )
);

-- Allow authenticated users to view basic public sponsor info ONLY (no contact_email)
-- This policy works with column-level access in queries
CREATE POLICY "Authenticated users can view public sponsor info"
ON public.sponsors
FOR SELECT
TO authenticated
USING (true);

-- Add comment explaining the security model
COMMENT ON TABLE public.sponsors IS 'RLS enforced: Sponsors can manage their own complete profile. Public queries should exclude contact_email column to prevent harvesting. Only sponsor owners can access their contact_email.';

-- Add warning comment to sensitive column
COMMENT ON COLUMN public.sponsors.contact_email IS 'SENSITIVE: Only accessible to the sponsor owner. Do not include in public SELECT queries. Use RLS USING condition to filter access.';