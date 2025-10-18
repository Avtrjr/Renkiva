-- Fix function search_path for calculate_storage_usage
-- This addresses the SUPA_function_search_path_mutable security finding

DROP FUNCTION IF EXISTS public.calculate_storage_usage();

CREATE OR REPLACE FUNCTION public.calculate_storage_usage()
RETURNS TABLE(bucket_name text, file_count bigint, total_size bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    bucket_id as bucket_name,
    COUNT(*) as file_count,
    COALESCE(SUM((metadata->>'size')::bigint), 0) as total_size
  FROM storage.objects 
  WHERE bucket_id IN ('meshtv-library', 'movies', 'ad-assets')
  GROUP BY bucket_id;
$$;