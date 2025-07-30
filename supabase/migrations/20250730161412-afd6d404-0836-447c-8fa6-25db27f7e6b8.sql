-- Remove videos with broken or null URLs
DELETE FROM public.shows 
WHERE video_url IS NULL 
   OR video_url = ''
   OR id IN (
     '850a7871-f039-41b0-90f2-99bf36c708d9', -- Cosmos: null URL
     '434c78b5-d252-4acc-af2b-7ec8faaa8713', -- Planet Earth: null URL
     '37c70fc9-70ce-489e-9c70-91b1b25a7b6a', -- Stranger Things: null URL
     'b7952d0e-9f9e-448e-b5a8-ae8da3ef3e4c', -- Planet Earth Documentary: null URL
     '7f81e71d-980b-4fad-8b40-3feae30d1ce7', -- Breaking Bad: null URL
     '45f9a16f-4846-456c-a445-0383bec97859', -- Friends: null URL
     '4973ca9a-df7a-473e-b86e-f214e7d614da'  -- The Office: null URL
   );