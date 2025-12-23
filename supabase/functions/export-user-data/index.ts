import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserDataExport {
  exportDate: string;
  dataRetentionInfo: {
    locationDataRetention: string;
    viewStatsRetention: string;
  };
  profile: any;
  shows: any[];
  viewStats: any[];
  meshNodes: any[];
  meshChannels: any[];
  creator: any;
  sponsor: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Exporting data for user: ${user.id}`);

    // Fetch all user data in parallel
    const [
      profileResult,
      usersResult,
      showsResult,
      viewStatsResult,
      meshNodesResult,
      meshChannelsResult,
      creatorsResult,
      sponsorsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('users').select('*').eq('auth_user_id', user.id).maybeSingle(),
      supabase.from('shows').select('*').eq('created_by', user.id),
      supabase.from('view_stats').select('*').eq('viewer_node_id', user.id).limit(1000),
      supabase.from('mesh_nodes').select('*').eq('user_id', user.id),
      supabase.from('mesh_channels').select('*').eq('owner_id', user.id),
      supabase.from('creators').select('*'),
      supabase.from('sponsors').select('*'),
    ]);

    // Filter creators and sponsors by user
    let userCreator = null;
    let userSponsor = null;
    
    if (usersResult.data) {
      const internalUserId = usersResult.data.id;
      userCreator = creatorsResult.data?.find((c: any) => c.user_id === internalUserId) || null;
      userSponsor = sponsorsResult.data?.find((s: any) => s.user_id === internalUserId) || null;
    }

    // Build export object
    const exportData: UserDataExport = {
      exportDate: new Date().toISOString(),
      dataRetentionInfo: {
        locationDataRetention: '90 days - location coordinates are automatically cleared after this period',
        viewStatsRetention: '90 days - view statistics older than this are automatically deleted',
      },
      profile: {
        ...profileResult.data,
        ...usersResult.data,
        // Redact sensitive fields
        id: '[REDACTED]',
        auth_user_id: '[REDACTED]',
      },
      shows: (showsResult.data || []).map((show: any) => ({
        ...show,
        created_by: '[REDACTED]',
      })),
      viewStats: (viewStatsResult.data || []).map((stat: any) => ({
        ...stat,
        viewer_node_id: '[REDACTED]',
        device_fingerprint: '[REDACTED]',
      })),
      meshNodes: (meshNodesResult.data || []).map((node: any) => ({
        ...node,
        user_id: '[REDACTED]',
        device_fingerprint: '[REDACTED]',
      })),
      meshChannels: (meshChannelsResult.data || []).map((channel: any) => ({
        ...channel,
        owner_id: '[REDACTED]',
      })),
      creator: userCreator ? {
        ...userCreator,
        id: '[REDACTED]',
        user_id: '[REDACTED]',
      } : null,
      sponsor: userSponsor ? {
        ...userSponsor,
        id: '[REDACTED]',
        user_id: '[REDACTED]',
      } : null,
    };

    // Update profile to record export request
    await supabase
      .from('profiles')
      .update({ data_export_requested_at: new Date().toISOString() } as any)
      .eq('id', user.id);

    console.log(`Data export completed for user: ${user.id}`);

    return new Response(
      JSON.stringify(exportData),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="renkiva-data-export-${new Date().toISOString().split('T')[0]}.json"`,
        } 
      }
    );

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to export data', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
