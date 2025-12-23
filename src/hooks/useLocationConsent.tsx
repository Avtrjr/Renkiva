import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface LocationConsentState {
  hasConsent: boolean | null;
  loading: boolean;
  consentGivenAt: Date | null;
}

export function useLocationConsent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<LocationConsentState>({
    hasConsent: null,
    loading: true,
    consentGivenAt: null,
  });

  // Check localStorage for quick access (for non-authenticated users)
  const checkLocalConsent = useCallback(() => {
    const localConsent = localStorage.getItem('location_consent');
    return localConsent === 'true';
  }, []);

  // Load consent status from database for authenticated users
  useEffect(() => {
    const loadConsent = async () => {
      // Check local storage first for immediate response
      const localConsent = checkLocalConsent();
      
      if (!user) {
        setState({
          hasConsent: localConsent,
          loading: false,
          consentGivenAt: null,
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('location_consent, consent_given_at')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading location consent:', error);
          setState({
            hasConsent: localConsent,
            loading: false,
            consentGivenAt: null,
          });
          return;
        }

        const consent = (data as any)?.location_consent || false;
        const consentDate = (data as any)?.consent_given_at 
          ? new Date((data as any).consent_given_at) 
          : null;

        // Sync local storage with database
        localStorage.setItem('location_consent', consent.toString());

        setState({
          hasConsent: consent,
          loading: false,
          consentGivenAt: consentDate,
        });
      } catch (error) {
        console.error('Error loading location consent:', error);
        setState({
          hasConsent: localConsent,
          loading: false,
          consentGivenAt: null,
        });
      }
    };

    loadConsent();
  }, [user, checkLocalConsent]);

  const grantConsent = useCallback(async () => {
    const now = new Date().toISOString();
    
    // Always update local storage
    localStorage.setItem('location_consent', 'true');
    localStorage.setItem('location_consent_at', now);

    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            location_consent: true,
            consent_given_at: now,
          } as any)
          .eq('id', user.id);

        if (error) {
          console.error('Error saving location consent:', error);
          toast({
            title: "Warning",
            description: "Consent saved locally but failed to sync to account.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error saving location consent:', error);
      }
    }

    setState({
      hasConsent: true,
      loading: false,
      consentGivenAt: new Date(now),
    });

    toast({
      title: "Location access enabled",
      description: "You can change this in settings at any time.",
    });

    return true;
  }, [user, toast]);

  const revokeConsent = useCallback(async () => {
    // Clear local storage
    localStorage.removeItem('location_consent');
    localStorage.removeItem('location_consent_at');

    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            location_consent: false,
            consent_given_at: null,
          } as any)
          .eq('id', user.id);

        if (error) {
          console.error('Error revoking location consent:', error);
        }
      } catch (error) {
        console.error('Error revoking location consent:', error);
      }
    }

    setState({
      hasConsent: false,
      loading: false,
      consentGivenAt: null,
    });

    toast({
      title: "Location access disabled",
      description: "Your location data will no longer be collected.",
    });

    return true;
  }, [user, toast]);

  const shouldShowConsentModal = state.hasConsent === false && !state.loading;

  return {
    hasConsent: state.hasConsent,
    loading: state.loading,
    consentGivenAt: state.consentGivenAt,
    shouldShowConsentModal,
    grantConsent,
    revokeConsent,
  };
}
