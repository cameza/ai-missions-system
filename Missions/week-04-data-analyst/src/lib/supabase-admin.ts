import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Get a singleton Supabase admin client using service role credentials.
 * Returns null if required environment variables are not configured.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('[manual-sync-rate-limit] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY; falling back to non-persistent rate limiting.');
    return null;
  }

  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  return supabaseAdmin;
}
