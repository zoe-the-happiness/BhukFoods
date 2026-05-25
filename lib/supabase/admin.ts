import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. NEVER import this from a "use client" file.
 * Bypasses RLS — only use from trusted server routes (cron jobs, admin actions,
 * subscriber form submissions).
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
