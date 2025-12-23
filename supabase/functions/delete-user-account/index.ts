import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create authenticated client to get user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting account deletion for user: ${user.id}`);

    // Use service role client to delete all user data
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // First, get the internal user ID from the users table
    const { data: internalUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    const internalUserId = internalUser?.id;

    // Delete all user data in parallel where possible
    const deletionPromises = [];

    // 1. Delete view_stats (by viewer_node_id if we have mesh nodes)
    // First get user's mesh node IDs
    const { data: meshNodes } = await supabaseAdmin
      .from('mesh_nodes')
      .select('id')
      .eq('user_id', internalUserId);
    
    const meshNodeIds = meshNodes?.map(n => n.id) || [];
    
    if (meshNodeIds.length > 0) {
      deletionPromises.push(
        supabaseAdmin.from('view_stats').delete().in('viewer_node_id', meshNodeIds)
      );
      
      // Delete fragment_receipts
      deletionPromises.push(
        supabaseAdmin.from('fragment_receipts').delete().in('receiver_node_id', meshNodeIds)
      );
      
      // Delete video_fragments by sender_node_id
      deletionPromises.push(
        supabaseAdmin.from('video_fragments').delete().in('sender_node_id', meshNodeIds)
      );
      
      // Delete broadcast_sessions
      deletionPromises.push(
        supabaseAdmin.from('broadcast_sessions').delete().in('broadcaster_node_id', meshNodeIds)
      );
      
      // Delete ad_impressions
      deletionPromises.push(
        supabaseAdmin.from('ad_impressions').delete().in('viewer_node_id', meshNodeIds)
      );
    }

    // 2. Delete mesh channels owned by user
    deletionPromises.push(
      supabaseAdmin.from('mesh_channels').delete().eq('owner_id', user.id)
    );

    // 3. Delete mesh nodes
    if (internalUserId) {
      deletionPromises.push(
        supabaseAdmin.from('mesh_nodes').delete().eq('user_id', internalUserId)
      );
    }

    // 4. Delete shows created by user
    deletionPromises.push(
      supabaseAdmin.from('shows').delete().eq('created_by', user.id)
    );

    // 5. Delete content events
    deletionPromises.push(
      supabaseAdmin.from('content_events').delete().eq('user_id', user.id)
    );

    // 6. Delete webhook settings
    deletionPromises.push(
      supabaseAdmin.from('webhook_settings').delete().eq('user_id', user.id)
    );

    // 7. Delete user roles
    deletionPromises.push(
      supabaseAdmin.from('user_roles').delete().eq('user_id', user.id)
    );

    // Wait for all deletions from related tables
    await Promise.all(deletionPromises);

    // Now delete creator and sponsor records (if they exist)
    if (internalUserId) {
      // Get creator ID to delete related records
      const { data: creator } = await supabaseAdmin
        .from('creators')
        .select('id')
        .eq('user_id', internalUserId)
        .maybeSingle();

      if (creator) {
        // Delete videos by this creator
        await supabaseAdmin.from('videos').delete().eq('creator_id', creator.id);
        // Delete the creator
        await supabaseAdmin.from('creators').delete().eq('id', creator.id);
      }

      // Get sponsor ID to delete related records
      const { data: sponsor } = await supabaseAdmin
        .from('sponsors')
        .select('id')
        .eq('user_id', internalUserId)
        .maybeSingle();

      if (sponsor) {
        // Delete ad campaigns
        await supabaseAdmin.from('ad_campaigns').delete().eq('sponsor_id', sponsor.id);
        // Delete mesh bundles
        await supabaseAdmin.from('mesh_bundles').delete().eq('sponsor_id', sponsor.id);
        // Delete the sponsor
        await supabaseAdmin.from('sponsors').delete().eq('id', sponsor.id);
      }

      // Delete ad assets uploaded by this user
      await supabaseAdmin.from('ad_assets').delete().eq('uploaded_by', user.id);

      // Delete the internal user record
      await supabaseAdmin.from('users').delete().eq('id', internalUserId);
    }

    // 8. Delete profile
    await supabaseAdmin.from('profiles').delete().eq('id', user.id);

    // 9. Delete storage objects (avatars, uploads)
    const storageBuckets = ['meshtv-library', 'movies', 'ad-assets'];
    for (const bucket of storageBuckets) {
      const { data: files } = await supabaseAdmin.storage
        .from(bucket)
        .list(user.id);
      
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${user.id}/${f.name}`);
        await supabaseAdmin.storage.from(bucket).remove(filePaths);
      }
    }

    // 10. Finally, delete the auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete auth account', details: deleteAuthError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Account deletion completed for user: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Account and all associated data deleted' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Account deletion error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete account', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
