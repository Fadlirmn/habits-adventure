import { createClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  key: string;
  isConfigured: boolean;
  source: 'env' | 'local' | 'none';
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, isConfigured: true, source: 'env' };
  }

  return { url: '', key: '', isConfigured: false, source: 'none' };
};

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (!url || !key) {
    localStorage.removeItem('benkyou_supabase_url');
    localStorage.removeItem('benkyou_supabase_key');
  } else {
    localStorage.setItem('benkyou_supabase_url', url.trim());
    localStorage.setItem('benkyou_supabase_key', key.trim());
  }
};
