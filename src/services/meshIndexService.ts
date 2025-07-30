import { supabase } from "@/integrations/supabase/client";

interface UploadMetadata {
  title: string;
  category: string;
  description: string;
}

interface MeshIndexEntry {
  id?: string;
  title: string;
  category: string;
  description: string;
  source_fingerprint: string;
  verified: boolean;
  created_at?: string;
  user_id?: string;
}

export class MeshIndexService {
  /**
   * Sync a verified upload to the mesh index
   */
  async syncVerifiedUpload(metadata: UploadMetadata, fingerprint: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('shows')
        .insert({
          title: metadata.title,
          category: metadata.category,
          description: metadata.description,
          is_public: true,
          // Store fingerprint in a custom field or as metadata
          video_url: `mesh://${fingerprint}` // Use custom protocol to indicate mesh content
        });

      if (error) {
        console.error('Error syncing to mesh index:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error syncing to mesh index:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get all verified uploads from the mesh index
   */
  async getVerifiedUploads(): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('is_public', true)
        .like('video_url', 'mesh://%')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mesh index:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Unexpected error fetching mesh index:', error);
      return { data: null, error: String(error) };
    }
  }

  /**
   * Mark an upload as favorite and verified
   */
  async markAsFavoriteAndVerified(uploadId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, you might update a favorites table
      // For now, we'll just log the action
      console.log(`Marked upload ${uploadId} as favorite and verified`);
      
      // You could also sync this to a user favorites table
      return { success: true };
    } catch (error) {
      console.error('Error marking as favorite:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Search the mesh index
   */
  async searchMeshIndex(query: string): Promise<{ data: any[] | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('is_public', true)
        .like('video_url', 'mesh://%')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching mesh index:', error);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Unexpected error searching mesh index:', error);
      return { data: null, error: String(error) };
    }
  }
}

// Export singleton instance
export const meshIndexService = new MeshIndexService();