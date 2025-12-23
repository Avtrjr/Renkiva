-- Add social links columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS twitter_url text,
ADD COLUMN IF NOT EXISTS github_url text,
ADD COLUMN IF NOT EXISTS website_url text;