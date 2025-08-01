import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useLegalAgreement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHasAcceptedLegal(null);
      setLoading(false);
      return;
    }

    const checkLegalAcceptance = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking legal acceptance:', error);
          setHasAcceptedLegal(false);
        } else {
          // Use bracket notation to access the new column
          setHasAcceptedLegal((data as any)?.accepted_legal || false);
        }
      } catch (error) {
        console.error('Error checking legal acceptance:', error);
        setHasAcceptedLegal(false);
      } finally {
        setLoading(false);
      }
    };

    checkLegalAcceptance();
  }, [user]);

  const acceptLegal = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          accepted_legal: true,
          legal_accepted_at: new Date().toISOString()
        } as any)
        .eq('id', user.id);

      if (error) {
        console.error('Error accepting legal terms:', error);
        toast({
          title: "Error",
          description: "Failed to save legal acceptance. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      setHasAcceptedLegal(true);
      toast({
        title: "Welcome to MeshTV!",
        description: "Legal terms accepted. You can now use all features.",
      });
      return true;
    } catch (error) {
      console.error('Error accepting legal terms:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const shouldShowLegalModal = user && hasAcceptedLegal === false;

  return {
    hasAcceptedLegal,
    shouldShowLegalModal,
    acceptLegal,
    loading
  };
}