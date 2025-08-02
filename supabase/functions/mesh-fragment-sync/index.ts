import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing mesh fragment sync request');
    
    const { deviceId, fragments, title, hash, size } = await req.json()

    console.log('Request data:', { 
      deviceId, 
      fragmentCount: fragments?.length, 
      title, 
      hash: hash?.substring(0, 8) + '...', 
      size 
    });

    // Validate required fields
    if (!deviceId || !title || !hash) {
      throw new Error('Missing required fields: deviceId, title, and hash are required');
    }

    // Store or update metadata
    const { data, error } = await supabase
      .from("mesh_fragments")
      .upsert({
        device_id: deviceId,
        video_title: title,
        fragment_hash: hash,
        fragment_count: fragments?.length || 0,
        total_size_mb: size || 0,
        last_seen: new Date().toISOString()
      }, { 
        onConflict: 'device_id,fragment_hash',
        ignoreDuplicates: false 
      })

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Successfully stored mesh fragment metadata:', data);

    return new Response(JSON.stringify({ 
      success: true, 
      stored: data,
      message: 'Mesh fragment metadata synchronized successfully'
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    })

  } catch (err) {
    console.error('Error in mesh fragment sync:', err);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message,
      details: 'Failed to synchronize mesh fragment metadata'
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    })
  }
})