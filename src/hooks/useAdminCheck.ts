import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Admin telegram IDs (from @petrfirstov and @ira_niroula)
const ADMIN_TELEGRAM_IDS = ['189415023', '828936535'];

interface UseAdminCheckResult {
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAdminCheck(telegramId: string | null): UseAdminCheckResult {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!telegramId) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // First check against hardcoded list (faster)
      if (ADMIN_TELEGRAM_IDS.includes(telegramId)) {
        setIsAdmin(true);
        setIsLoading(false);
        return;
      }

      // Then check database
      try {
        const { data, error } = await supabase
          .rpc('is_admin_telegram', { _telegram_id: telegramId });

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (err) {
        console.error('Error checking admin:', err);
        setIsAdmin(false);
      }

      setIsLoading(false);
    };

    checkAdmin();
  }, [telegramId]);

  return { isAdmin, isLoading };
}

export { ADMIN_TELEGRAM_IDS };
