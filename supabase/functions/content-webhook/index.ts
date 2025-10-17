import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateWebhookURL } from '../_shared/urlValidator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentWebhookPayload {
  show_id: string;
  title: string;
  video_url?: string;
  action: 'created' | 'updated' | 'deleted';
  user_id: string;
  external_webhook_url?: string;
}

interface VideoMetadata {
  duration?: number;
  thumbnail?: string;
  fileSize?: number;
  format?: string;
  resolution?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Content webhook triggered:', req.method, req.url);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const payload: ContentWebhookPayload = await req.json();
      console.log('Webhook payload:', payload);

      // Validate required fields
      if (!payload.show_id || !payload.action) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: show_id, action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Process the webhook based on action
      switch (payload.action) {
        case 'created':
          await handleContentCreated(supabase, payload);
          break;
        case 'updated':
          await handleContentUpdated(supabase, payload);
          break;
        case 'deleted':
          await handleContentDeleted(supabase, payload);
          break;
        default:
          console.log('Unknown action:', payload.action);
      }

      // If external webhook URL is provided, forward the notification
      if (payload.external_webhook_url) {
        await forwardToExternalWebhook(payload);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Content ${payload.action} processed successfully`,
          show_id: payload.show_id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleContentCreated(supabase: any, payload: ContentWebhookPayload) {
  console.log('Processing content creation:', payload.show_id);

  try {
    // Get the show details
    const { data: show, error: showError } = await supabase
      .from('shows')
      .select('*')
      .eq('id', payload.show_id)
      .single();

    if (showError || !show) {
      console.error('Show not found:', showError);
      return;
    }

    // If video URL is provided, try to extract metadata
    if (show.video_url) {
      const metadata = await extractVideoMetadata(show.video_url);
      
      if (metadata) {
        // Update the show with extracted metadata
        const { error: updateError } = await supabase
          .from('shows')
          .update({
            duration_minutes: metadata.duration ? Math.round(metadata.duration / 60) : null,
            thumbnail_url: metadata.thumbnail || show.thumbnail_url,
            file_size_bytes: metadata.fileSize || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', payload.show_id);

        if (updateError) {
          console.error('Error updating show metadata:', updateError);
        } else {
          console.log('Successfully updated show metadata');
        }
      }
    }

    // Log the content creation event
    await logContentEvent(supabase, {
      show_id: payload.show_id,
      action: 'created',
      user_id: payload.user_id,
      metadata: { title: show.title, category: show.category }
    });

  } catch (error) {
    console.error('Error handling content creation:', error);
  }
}

async function handleContentUpdated(supabase: any, payload: ContentWebhookPayload) {
  console.log('Processing content update:', payload.show_id);
  
  await logContentEvent(supabase, {
    show_id: payload.show_id,
    action: 'updated',
    user_id: payload.user_id,
    metadata: { title: payload.title }
  });
}

async function handleContentDeleted(supabase: any, payload: ContentWebhookPayload) {
  console.log('Processing content deletion:', payload.show_id);
  
  await logContentEvent(supabase, {
    show_id: payload.show_id,
    action: 'deleted',
    user_id: payload.user_id,
    metadata: { title: payload.title }
  });
}

async function extractVideoMetadata(videoUrl: string): Promise<VideoMetadata | null> {
  try {
    console.log('Extracting metadata from video URL:', videoUrl);
    
    // For demo purposes, we'll simulate metadata extraction
    // In a real implementation, you might use ffprobe or similar tools
    
    // Check if it's a YouTube or other platform URL
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // For YouTube videos, you could use the YouTube API
      return {
        duration: 120, // 2 minutes (placeholder)
        format: 'mp4',
        resolution: '1080p'
      };
    }
    
    // For direct video URLs, you could make a HEAD request to get file size
    try {
      const response = await fetch(videoUrl, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      
      return {
        fileSize: contentLength ? parseInt(contentLength) : undefined,
        format: getFormatFromUrl(videoUrl)
      };
    } catch (fetchError) {
      console.log('Could not fetch video metadata:', fetchError);
      return null;
    }
    
  } catch (error) {
    console.error('Error extracting video metadata:', error);
    return null;
  }
}

function getFormatFromUrl(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase();
  return extension || 'unknown';
}

async function logContentEvent(supabase: any, event: {
  show_id: string;
  action: string;
  user_id: string;
  metadata: any;
}) {
  try {
    const { error } = await supabase
      .from('content_events')
      .insert({
        show_id: event.show_id,
        action: event.action,
        user_id: event.user_id,
        metadata: event.metadata,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging content event:', error);
    }
  } catch (error) {
    console.error('Error in logContentEvent:', error);
  }
}

async function forwardToExternalWebhook(payload: ContentWebhookPayload) {
  if (!payload.external_webhook_url) return;

  // Validate webhook URL to prevent SSRF
  const validation = validateWebhookURL(payload.external_webhook_url);
  if (!validation.valid) {
    console.error('Webhook URL validation failed:', validation.error);
    throw new Error(`Invalid webhook URL: ${validation.error}`);
  }

  try {
    console.log('Forwarding to external webhook:', payload.external_webhook_url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(payload.external_webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: 'MeshTV'
      }),
      signal: controller.signal,
      redirect: 'manual', // Don't follow redirects
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('External webhook failed:', response.status, response.statusText);
    } else {
      console.log('External webhook successful');
    }
  } catch (error) {
    console.error('Error calling external webhook:', error);
  }
}