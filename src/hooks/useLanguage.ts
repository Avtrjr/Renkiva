import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, languageNames, isRTL } from '@/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Apply RTL direction on language change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.dir = isRTL(i18n.language) ? 'rtl' : 'ltr';
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  // Sync language with user's profile preference
  useEffect(() => {
    const syncLanguageFromProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('language_preference')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching language preference:', error);
        } else if (data?.language_preference && data.language_preference !== i18n.language) {
          changeLanguage(data.language_preference);
        }
      } catch (err) {
        console.error('Error syncing language:', err);
      } finally {
        setIsLoading(false);
      }
    };

    syncLanguageFromProfile();
  }, [user, i18n.language]);

  const setLanguage = async (lng: string) => {
    changeLanguage(lng);
    
    // Also update the database if user is logged in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ 
            language_preference: lng,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      } catch (err) {
        console.error('Error saving language preference:', err);
      }
    }
  };

  return {
    currentLanguage: i18n.language,
    setLanguage,
    t,
    languageNames,
    isLoading,
    isRTL: isRTL(i18n.language),
  };
};
