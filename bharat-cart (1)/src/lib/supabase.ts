import { createClient } from '@supabase/supabase-js';

// Get environment variables with import.meta.env
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));

let supabaseClient: any = null;

export function getSupabase() {
  if (!isSupabaseConfigured) {
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return supabaseClient;
}

// Resilient dummy fallback proxy to prevent null pointer exceptions
const dummySupabase = {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOtp: async () => ({ error: new Error('Supabase client is running in simulation mode. Please configure Supabase environment keys.') }),
    signInWithPassword: async () => ({ error: new Error('Supabase client is running in simulation mode. Please configure Supabase environment keys.') }),
    signUp: async () => ({ error: new Error('Supabase client is running in simulation mode. Please configure Supabase environment keys.') }),
    signOut: async () => {},
  }
};

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : (dummySupabase as any);
