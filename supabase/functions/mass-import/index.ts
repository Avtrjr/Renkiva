import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, getRemainingRequests, getResetTime } from '../_shared/rateLimiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ArchiveMovie {
  identifier: string;
  title: string;
  description: string;
}

interface ArchiveResponse {
  response: {
    docs: ArchiveMovie[];
  };
}

interface FileMetadata {
  name: string;
  size: string;
  format: string;
}

interface ArchiveMetadata {
  files: FileMetadata[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (req.method === 'POST') {
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      return new Response(
        JSON.stringify({ error: 'Admin access required for mass import' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: 10 imports per hour for admins
    if (!checkRateLimit(user.id, 10)) {
      const remaining = getRemainingRequests(user.id, 10);
      const resetTime = getResetTime(user.id);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          remaining,
          resetInSeconds: resetTime
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { limit = 5 } = await req.json();
      
      console.log(`🎬 Starting mass import of ${limit} movies...`);
      
      // Step 1: Fetch public domain movies from Archive.org
      const archiveUrl = `https://archive.org/advancedsearch.php?q=collection%3Afeature_films+AND+mediatype%3Amovies&fl[]=identifier&fl[]=title&fl[]=description&sort[]=downloads+desc&rows=${limit}&page=1&output=json`;
      
      const archiveRes = await fetch(archiveUrl);
      const archiveData: ArchiveResponse = await archiveRes.json();
      
      const results = [];
      
      for (const movie of archiveData.response.docs) {
        try {
          console.log(`Processing: ${movie.title}`);
          
          // Step 2: Get metadata and find MP4 file
          const metadataRes = await fetch(`https://archive.org/metadata/${movie.identifier}`);
          const metadata: ArchiveMetadata = await metadataRes.json();
          
          const mp4File = metadata.files.find(f => 
            f.name.endsWith('.mp4') && 
            f.format === 'h.264' &&
            parseInt(f.size) > 100000000 // At least 100MB
          );
          
          if (!mp4File) {
            console.log(`❌ No suitable MP4 found for ${movie.title}`);
            continue;
          }
          
          const videoUrl = `https://archive.org/download/${movie.identifier}/${mp4File.name}`;
          console.log(`📥 Found video: ${videoUrl}`);
          
          // Step 3: Download video file
          const videoRes = await fetch(videoUrl);
          if (!videoRes.ok) {
            console.log(`❌ Failed to download ${movie.title}`);
            continue;
          }
          
          const videoBlob = await videoRes.blob();
          const filename = `${movie.identifier}.mp4`;
          
          // Step 4: Upload to Supabase Storage
          console.log(`📤 Uploading ${filename}...`);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('meshtv-library')
            .upload(filename, videoBlob, {
              contentType: 'video/mp4',
              upsert: true
            });
          
          if (uploadError) {
            console.error(`❌ Upload failed for ${movie.title}:`, uploadError);
            continue;
          }
          
          // Step 5: Get public URL
          const { data: urlData } = supabase.storage
            .from('meshtv-library')
            .getPublicUrl(filename);
          
          // Step 6: Insert metadata into shows table
          const { data: showData, error: showError } = await supabase
            .from('shows')
            .insert({
              title: movie.title || 'Untitled',
              description: movie.description || 'Classic public domain film',
              category: 'Classic',
              video_url: urlData.publicUrl,
              is_public: true,
              file_size_bytes: parseInt(mp4File.size),
              duration_minutes: null, // Could be extracted from metadata if available
              thumbnail_url: `https://archive.org/services/img/${movie.identifier}`,
            });
          
          if (showError) {
            console.error(`❌ Database insert failed for ${movie.title}:`, showError);
            continue;
          }
          
          console.log(`✅ Successfully imported: ${movie.title}`);
          results.push({
            title: movie.title,
            identifier: movie.identifier,
            status: 'success'
          });
          
        } catch (error) {
          console.error(`❌ Error processing ${movie.title}:`, error);
          results.push({
            title: movie.title,
            identifier: movie.identifier,
            status: 'error',
            error: error.message
          });
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Mass import completed. Processed ${results.length} movies.`,
          results
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({
          message: 'MeshTV Mass Import Service',
          usage: 'POST with { "limit": 5 } to import movies'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    
  } catch (error) {
    console.error('Mass import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});