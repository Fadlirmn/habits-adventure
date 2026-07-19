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

let cachedClient: any = null;

export const getSupabaseClient = () => {
  if (cachedClient) return cachedClient;

  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  try {
    cachedClient = createClient(url, key);
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};
