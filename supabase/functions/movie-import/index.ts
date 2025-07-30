import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MovieMetadata {
  title: string
  description: string
  category: string
  duration_minutes?: number
  thumbnail_url?: string
  source: string
  tags: string[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const formData = await req.formData()
      const videoFile = formData.get('video') as File
      const metadataStr = formData.get('metadata') as string
      
      if (!videoFile || !metadataStr) {
        return new Response(
          JSON.stringify({ error: 'Video file and metadata are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const metadata: MovieMetadata = JSON.parse(metadataStr)
      console.log(`Processing movie: ${metadata.title}`)

      // Create a safe filename
      const safeTitle = metadata.title.replace(/[^a-zA-Z0-9\s-_]/g, '').trim()
      const timestamp = Date.now()
      const fileName = `${safeTitle}_${timestamp}.mp4`
      const filePath = `movies/${fileName}`

      // Upload video to Supabase storage
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('movies')
        .upload(filePath, videoFile, {
          contentType: 'video/mp4',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return new Response(
          JSON.stringify({ error: 'Failed to upload video file' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get public URL for the uploaded video
      const { data: urlData } = supabaseClient.storage
        .from('movies')
        .getPublicUrl(filePath)

      // Insert movie metadata into shows table
      const { data: showData, error: insertError } = await supabaseClient
        .from('shows')
        .insert({
          title: metadata.title,
          description: metadata.description,
          category: metadata.category,
          duration_minutes: metadata.duration_minutes,
          thumbnail_url: metadata.thumbnail_url,
          video_url: urlData.publicUrl,
          file_size_bytes: videoFile.size,
          is_public: true,
          created_by: null // Public content from script
        })
        .select()

      if (insertError) {
        console.error('Database insert error:', insertError)
        // Clean up uploaded file if database insert fails
        await supabaseClient.storage.from('movies').remove([filePath])
        
        return new Response(
          JSON.stringify({ error: 'Failed to save movie metadata' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Successfully imported: ${metadata.title}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          movie: showData[0],
          message: `Successfully imported: ${metadata.title}`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET request - return import status
    if (req.method === 'GET') {
      const { data: moviesCount } = await supabaseClient
        .from('shows')
        .select('id', { count: 'exact' })
        .eq('is_public', true)

      return new Response(
        JSON.stringify({ 
          success: true,
          totalMovies: moviesCount?.length || 0,
          message: 'Movie import service is running'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})