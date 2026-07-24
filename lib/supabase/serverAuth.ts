import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export type CallerAuth = {
  userId: string;
  organizationId: string | null;
  role: string | null;
};

/**
 * Resolves the identity of whoever is calling an API route, from the
 * Supabase session cookie on the incoming request. Must be called with a
 * service-role client so the profiles lookup isn't itself blocked by RLS.
 * Returns null if there is no valid session at all.
 */
export async function getCallerAuth(supabaseAdmin: SupabaseClient): Promise<CallerAuth | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Read-only auth check — no response to attach refreshed cookies to.
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('organization_id, role')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  return {
    userId: user.id,
    organizationId: profile?.organization_id ?? null,
    role: profile?.role ?? null,
  };
}
