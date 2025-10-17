-- Fix mesh_packets RLS policies to prevent unauthorized network monitoring
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert packets" ON public.mesh_packets;
DROP POLICY IF EXISTS "Anyone can view packets" ON public.mesh_packets;

-- Allow users to insert packets only from their own mesh nodes
CREATE POLICY "Users can insert packets from their nodes"
ON public.mesh_packets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.mesh_nodes mn
    JOIN public.users u ON mn.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND (mn.id::text = mesh_packets.sender_id OR mn.device_fingerprint = mesh_packets.sender_id)
  )
);

-- Allow users to view packets sent from or to their mesh nodes
CREATE POLICY "Users can view packets for their nodes"
ON public.mesh_packets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.mesh_nodes mn
    JOIN public.users u ON mn.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND (
      mn.id::text = mesh_packets.sender_id 
      OR mn.device_fingerprint = mesh_packets.sender_id
      OR mn.id::text = mesh_packets.receiver_id 
      OR mn.device_fingerprint = mesh_packets.receiver_id
    )
  )
);

-- Add comment explaining the security model
COMMENT ON TABLE public.mesh_packets IS 'RLS enforced: Only authenticated mesh node owners can send/receive packets. This prevents network eavesdropping and unauthorized packet injection.';