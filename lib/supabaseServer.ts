import { createClient } from "@supabase/supabase-js";

// Server-only client using the service_role key. Lazily constructed so a missing
// env var doesn't crash the build — it only throws when a write is attempted.
export function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY (server) is not set");
  return createClient(url, key, { auth: { persistSession: false } });
}
