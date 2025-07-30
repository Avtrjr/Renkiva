-- Fix search_path security warnings for functions
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.discover_nearby_content() SET search_path = '';