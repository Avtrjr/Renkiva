-- Fix the SECURITY DEFINER view issue
-- Drop the view and recreate it properly with SECURITY INVOKER (default)

DROP VIEW IF EXISTS public.public_sponsors;

-- Recreate the view with explicit SECURITY INVOKER
CREATE VIEW public.public_sponsors
WITH (security_invoker = true)
AS
SELECT 
  id,
  company_name,
  logo_url,
  created_at
FROM public.sponsors;

-- Grant access to the view
GRANT SELECT ON public.public_sponsors TO authenticated;
GRANT SELECT ON public.public_sponsors TO anon;