import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing channel join request');
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { invite_code, device_id } = await req.json();

    // Validate input
    if (!invite_code || !device_id) {
      console.error('Missing required fields:', { invite_code: !!invite_code, device_id: !!device_id });
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: invite_code and device_id are required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Looking up invite:', { invite_code: invite_code.substring(0, 8) + '...', device_id });

    // Get invite details
    const { data: invite, error: inviteError } = await supabase
      .from('mesh_channel_invites')
      .select('id, channel_id, expires_at, used_by, max_uses')
      .eq('invite_code', invite_code)
      .single();

    if (inviteError || !invite) {
      console.error('Invalid invite code:', inviteError);
      return new Response(JSON.stringify({ 
        error: 'Invalid invite code' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Found invite:', { 
      id: invite.id, 
      channel_id: invite.channel_id, 
      current_uses: invite.used_by?.length || 0,
      max_uses: invite.max_uses 
    });

    // Check if invite has expired
    const now = new Date().toISOString();
    if (invite.expires_at && invite.expires_at < now) {
      console.error('Invite expired:', { expires_at: invite.expires_at, now });
      return new Response(JSON.stringify({ 
        error: 'Invite has expired' 
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Check if invite has reached max uses
    if (invite.used_by && invite.used_by.length >= invite.max_uses) {
      console.error('Invite maxed out:', { current_uses: invite.used_by.length, max_uses: invite.max_uses });
      return new Response(JSON.stringify({ 
        error: 'Invite has reached maximum usage limit' 
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Check if device already joined
    const alreadyJoined = invite.used_by?.includes(device_id);
    console.log('Device join status:', { device_id, alreadyJoined });

    // Add device to used_by array if not already joined
    if (!alreadyJoined) {
      const updatedUsedBy = [...(invite.used_by || []), device_id];
      
      const { error: updateError } = await supabase
        .from('mesh_channel_invites')
        .update({ used_by: updatedUsedBy })
        .eq('id', invite.id);

      if (updateError) {
        console.error('Failed to update invite usage:', updateError);
        return new Response(JSON.stringify({ 
          error: 'Failed to update invite usage' 
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      console.log('Updated invite usage:', { new_count: updatedUsedBy.length });
    } else {
      console.log('Device already joined this channel');
    }

    // Get channel details
    const { data: channel, error: channelError } = await supabase
      .from('mesh_channels')
      .select('id, channel_name, encryption_key, is_private')
      .eq('id', invite.channel_id)
      .single();

    if (channelError || !channel) {
      console.error('Channel not found:', channelError);
      return new Response(JSON.stringify({ 
        error: 'Channel not found' 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Successfully joined channel:', { 
      channel_id: channel.id, 
      channel_name: channel.channel_name,
      is_private: channel.is_private 
    });

    return new Response(JSON.stringify({
      success: true,
      channel_id: channel.id,
      channel_name: channel.channel_name,
      encryption_key: channel.encryption_key,
      is_private: channel.is_private,
      already_joined: alreadyJoined
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Unexpected error in channel join:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
})