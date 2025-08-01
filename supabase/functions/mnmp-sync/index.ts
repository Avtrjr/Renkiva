import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// MNMP Protocol Types
interface MNMPPacket {
  version: number;
  type: number;
  ttl: number;
  flags: {
    compressed: boolean;
    encrypted: boolean;
    fragmented: boolean;
    broadcast: boolean;
  };
  timestamp: number;
  senderId: string;
  receiverId: string;
  payloadLength: number;
  signature?: Uint8Array;
  payload: Uint8Array;
}

interface StreamFragment {
  streamId: string;
  fragmentIndex: number;
  totalFragments: number;
  data: Uint8Array;
  checksum: string;
}

// Encryption utilities (simplified for edge function)
class MNMPEncryption {
  async encryptPayload(payload: Uint8Array, key: string): Promise<Uint8Array> {
    console.log(`[MNMP Sync] Encrypting ${payload.length} bytes`);
    
    try {
      // Generate a random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Import the key (in production, use proper key derivation)
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(key.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      
      // Encrypt the payload
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        payload
      );
      
      // Combine IV + encrypted data
      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv, 0);
      result.set(new Uint8Array(encrypted), iv.length);
      
      console.log(`[MNMP Sync] Encryption complete: ${result.length} bytes`);
      return result;
    } catch (error) {
      console.error('[MNMP Sync] Encryption failed:', error);
      throw error;
    }
  }

  async decryptPayload(encryptedPayload: Uint8Array, key: string): Promise<Uint8Array> {
    console.log(`[MNMP Sync] Decrypting ${encryptedPayload.length} bytes`);
    
    try {
      // Extract IV and encrypted data
      const iv = encryptedPayload.slice(0, 12);
      const encrypted = encryptedPayload.slice(12);
      
      // Import the key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(key.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        encrypted
      );
      
      console.log(`[MNMP Sync] Decryption complete: ${decrypted.byteLength} bytes`);
      return new Uint8Array(decrypted);
    } catch (error) {
      console.error('[MNMP Sync] Decryption failed:', error);
      throw error;
    }
  }

  generateNodeId(): string {
    return 'node-' + Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const encryption = new MNMPEncryption();

  try {
    const { action, data } = await req.json();
    console.log(`[MNMP Sync] Processing action: ${action}`);

    switch (action) {
      case 'sync_packet': {
        const { packet, nodeId, encryptionKey } = data;
        
        // Decrypt packet if encrypted
        let processedPayload = packet.payload;
        if (packet.flags.encrypted && encryptionKey) {
          const payloadBuffer = encryption.base64ToArrayBuffer(packet.payload);
          const decryptedBuffer = await encryption.decryptPayload(
            new Uint8Array(payloadBuffer), 
            encryptionKey
          );
          processedPayload = encryption.arrayBufferToBase64(decryptedBuffer);
        }

        // Store packet in database
        const { data: packetRecord, error } = await supabase
          .from('mesh_packets')
          .insert({
            packet_type: packet.type,
            sender_id: packet.senderId,
            receiver_id: packet.receiverId,
            ttl: packet.ttl,
            timestamp: new Date(packet.timestamp).toISOString(),
            payload: processedPayload,
            flags: packet.flags,
            processed_by_node: nodeId
          })
          .select()
          .single();

        if (error) {
          console.error('[MNMP Sync] Database error:', error);
          throw error;
        }

        // Process specific packet types
        if (packet.type === 1) { // STREAM_START
          const metadata = JSON.parse(new TextDecoder().decode(
            new Uint8Array(encryption.base64ToArrayBuffer(processedPayload))
          ));
          
          await supabase.from('mesh_streams').upsert({
            stream_id: metadata.streamId,
            title: metadata.metadata?.title,
            description: metadata.metadata?.description,
            category: metadata.metadata?.category,
            total_fragments: metadata.totalFragments,
            checksum: metadata.checksum,
            sender_node: packet.senderId,
            started_at: new Date().toISOString()
          });
        }

        if (packet.type === 2) { // STREAM_FRAGMENT
          // Extract fragment data from payload
          const payloadData = new Uint8Array(encryption.base64ToArrayBuffer(processedPayload));
          const streamId = new TextDecoder().decode(payloadData.slice(0, 36)).replace(/\0/g, '');
          const fragmentIndex = new DataView(payloadData.buffer).getUint32(36, true);
          const totalFragments = new DataView(payloadData.buffer).getUint32(40, true);
          const fragmentData = payloadData.slice(44);

          await supabase.from('stream_fragments').insert({
            stream_id: streamId,
            fragment_index: fragmentIndex,
            total_fragments: totalFragments,
            data: encryption.arrayBufferToBase64(fragmentData),
            received_from_node: packet.senderId,
            received_at: new Date().toISOString()
          });

          // Check if stream is complete
          const { count } = await supabase
            .from('stream_fragments')
            .select('*', { count: 'exact', head: true })
            .eq('stream_id', streamId);

          if (count === totalFragments) {
            await supabase
              .from('mesh_streams')
              .update({ 
                completed_at: new Date().toISOString(),
                is_complete: true 
              })
              .eq('stream_id', streamId);
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          packetId: packetRecord.id,
          message: 'Packet synced successfully' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'encrypt_packet': {
        const { packet, encryptionKey } = data;
        
        // Encrypt the payload
        const payloadBuffer = encryption.base64ToArrayBuffer(packet.payload);
        const encryptedBuffer = await encryption.encryptPayload(
          new Uint8Array(payloadBuffer),
          encryptionKey
        );
        
        const encryptedPacket = {
          ...packet,
          payload: encryption.arrayBufferToBase64(encryptedBuffer),
          flags: { ...packet.flags, encrypted: true }
        };

        return new Response(JSON.stringify({ 
          success: true, 
          encryptedPacket 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'decrypt_packet': {
        const { encryptedPacket, encryptionKey } = data;
        
        // Decrypt the payload
        const payloadBuffer = encryption.base64ToArrayBuffer(encryptedPacket.payload);
        const decryptedBuffer = await encryption.decryptPayload(
          new Uint8Array(payloadBuffer),
          encryptionKey
        );
        
        const decryptedPacket = {
          ...encryptedPacket,
          payload: encryption.arrayBufferToBase64(decryptedBuffer),
          flags: { ...encryptedPacket.flags, encrypted: false }
        };

        return new Response(JSON.stringify({ 
          success: true, 
          decryptedPacket 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_streams': {
        const { nodeId } = data;
        
        const { data: streams, error } = await supabase
          .from('mesh_streams')
          .select(`
            *,
            stream_fragments (
              fragment_index,
              total_fragments,
              received_at
            )
          `)
          .order('started_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          streams 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_fragments': {
        const { streamId } = data;
        
        const { data: fragments, error } = await supabase
          .from('stream_fragments')
          .select('*')
          .eq('stream_id', streamId)
          .order('fragment_index');

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          fragments 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'register_node': {
        const { nodeInfo } = data;
        
        const { data: node, error } = await supabase
          .from('mesh_nodes')
          .upsert({
            id: nodeInfo.id || encryption.generateNodeId(),
            node_name: nodeInfo.name || `Node-${Date.now()}`,
            device_fingerprint: nodeInfo.fingerprint,
            signal_strength: nodeInfo.signalStrength || 100,
            latitude: nodeInfo.location?.lat,
            longitude: nodeInfo.location?.lng,
            is_active: true,
            last_seen: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          nodeId: node.id,
          message: 'Node registered successfully' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_node_status': {
        const { nodeId, status } = data;
        
        const { error } = await supabase
          .from('mesh_nodes')
          .update({
            is_active: status.isActive,
            signal_strength: status.signalStrength,
            last_seen: new Date().toISOString()
          })
          .eq('id', nodeId);

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true,
          message: 'Node status updated' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Unknown action: ${action}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('[MNMP Sync] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});