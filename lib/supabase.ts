import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Read-only browser client. RLS allows anon SELECT only; writes are blocked
// here and will go through server-side API routes (Step 5) using a secret key.
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
