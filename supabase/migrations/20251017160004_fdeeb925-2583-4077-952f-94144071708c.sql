-- Remove encryption keys from database to prevent key theft
-- Encryption keys should NEVER be stored server-side

-- Drop the encryption_key column from mesh_channels
ALTER TABLE public.mesh_channels DROP COLUMN IF EXISTS encryption_key;

-- Add a comment explaining the security model
COMMENT ON TABLE public.mesh_channels IS 'RLS enforced: Channel metadata only. Encryption keys are derived client-side from user passphrases and never stored in the database. This prevents key theft even if the database is compromised.';

-- Add a passphrase_hint column to help users remember their keys (optional)
ALTER TABLE public.mesh_channels ADD COLUMN passphrase_hint text;

COMMENT ON COLUMN public.mesh_channels.passphrase_hint IS 'Optional hint to help channel owners remember their passphrase. Does NOT contain the actual passphrase or encryption key.';