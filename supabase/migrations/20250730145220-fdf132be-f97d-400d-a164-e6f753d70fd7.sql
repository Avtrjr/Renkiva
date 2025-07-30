-- Add unique constraint to title column in shows table to prevent duplicates
ALTER TABLE public.shows ADD CONSTRAINT shows_title_unique UNIQUE (title);