import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema to prevent injection attacks
const uploadContentSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  description: z.string()
    .max(2000, "Description must be less than 2000 characters")
    .trim()
    .optional(),
  category: z.string()
    .max(100, "Category must be less than 100 characters")
    .trim()
    .optional(),
  video_url: z.string()
    .url("Invalid video URL")
    .refine(url => {
      const validProtocols = ['http:', 'https:'];
      try {
        const parsedUrl = new URL(url);
        return validProtocols.includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    }, "Only HTTP and HTTPS URLs are allowed")
    .optional(),
  thumbnail_url: z.string()
    .url("Invalid thumbnail URL")
    .refine(url => {
      const validProtocols = ['http:', 'https:'];
      try {
        const parsedUrl = new URL(url);
        return validProtocols.includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    }, "Only HTTP and HTTPS URLs are allowed")
    .optional(),
  duration_minutes: z.number()
    .int("Duration must be an integer")
    .min(0, "Duration must be positive")
    .max(10000, "Duration is too large")
    .optional(),
  file_size_bytes: z.number()
    .int("File size must be an integer")
    .min(0, "File size must be positive")
    .optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    // Parse and validate request body
    const rawBody = await req.json();
    console.log('Request body:', rawBody);
    
    const validationResult = uploadContentSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Validation failed',
          details: errors
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { title, description, category, video_url, thumbnail_url, duration_minutes, file_size_bytes } = validationResult.data;

    // Get user record to get internal user ID, create if doesn't exist
    console.log('Looking for user with auth_user_id:', user.id);
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    console.log('User lookup result:', { userData, userError });

    if (userError || !userData) {
      // User doesn't exist in users table, create it
      console.log('Creating new user record for:', user.id);
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth_user_id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          display_name: user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url
        })
        .select('id')
        .single();

      console.log('User creation result:', { newUser, createError });

      if (createError) {
        throw new Error(`Failed to create user record: ${createError.message}`);
      }
      
      userData = newUser;
    }

    // Ensure profile exists (required by foreign key constraint)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        display_name: user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.log('Profile upsert error:', profileError);
    }

    console.log('Final userData:', userData);

    // Insert content into shows table
    const { data, error } = await supabase
      .from('shows')
      .insert({
        title,
        description,
        category: category || 'User Upload',
        video_url,
        thumbnail_url,
        duration_minutes,
        file_size_bytes,
        created_by: userData.id,
        is_public: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: "Content uploaded successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});