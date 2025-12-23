-- Add language preference column to profiles
ALTER TABLE public.profiles 
ADD COLUMN language_preference TEXT DEFAULT 'en';