import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Show = Database['public']['Tables']['shows']['Row'];

export function useShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShows() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('shows')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setShows(data || []);
      } catch (err) {
        console.error('Error fetching shows:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch shows');
      } finally {
        setLoading(false);
      }
    }

    fetchShows();
  }, []);

  return { shows, loading, error };
}