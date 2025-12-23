-- Add admin role to user 'cool'
INSERT INTO public.user_roles (user_id, role)
VALUES ('7e9dc200-2328-485d-85d3-229f6ba239af', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;