import { supabase } from '@/integrations/supabase/client';

export interface SponsorStats {
  views: number;
  devices: number;
  estimatedRevenue: number;
}

export interface AdAsset {
  id: string;
  filename: string;
  type: 'video' | 'image';
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  fileSize: number;
  mimeType: string;
  storagePath: string;
}

export async function getSponsorStats(): Promise<SponsorStats> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's internal ID from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      // Return zero stats if user profile not found
      return {
        views: 0,
        devices: 0,
        estimatedRevenue: 0
      };
    }

    // Call the database function to get stats
    const { data: statsData, error: statsError } = await supabase.rpc('get_sponsor_stats', {
      sponsor_user_id: userData.id
    });

    if (statsError) {
      throw statsError;
    }

    // Parse the JSON response from the database function
    if (statsData && typeof statsData === 'object') {
      const stats = statsData as any;
      return {
        views: stats.views || 0,
        devices: stats.devices || 0,
        estimatedRevenue: parseFloat(stats.estimatedRevenue) || 0
      };
    }

    return {
      views: 0,
      devices: 0,
      estimatedRevenue: 0
    };
  } catch (error) {
    console.error('Error fetching sponsor stats:', error);
    throw new Error('Failed to fetch sponsor statistics');
  }
}

export async function submitAdAsset(file: File): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's internal ID from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User profile not found');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ad-assets')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    // Create record in ad_assets table
    const { data: assetData, error: dbError } = await supabase
      .from('ad_assets')
      .insert({
        filename: file.name,
        storage_path: uploadData.path,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        file_size: file.size,
        mime_type: file.type,
        status: 'pending',
        uploaded_by: userData.id
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    return {
      success: true,
      id: assetData.id
    };

  } catch (error) {
    console.error('Error submitting ad asset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function getAdAssets(): Promise<AdAsset[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's internal ID from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      return [];
    }

    // Fetch user's ad assets
    const { data: assets, error } = await supabase
      .from('ad_assets')
      .select('*')
      .eq('uploaded_by', userData.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return assets.map(asset => ({
      id: asset.id,
      filename: asset.filename,
      type: asset.type as 'video' | 'image',
      uploadedAt: asset.created_at,
      status: asset.status as 'pending' | 'approved' | 'rejected',
      fileSize: asset.file_size,
      mimeType: asset.mime_type,
      storagePath: asset.storage_path
    }));

  } catch (error) {
    console.error('Error fetching ad assets:', error);
    throw new Error('Failed to fetch ad assets');
  }
}