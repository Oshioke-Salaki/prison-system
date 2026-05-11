import { createClient } from '@supabase/supabase-js';

// Note: This client uses the SERVICE_ROLE_KEY and should ONLY be used in server-side contexts (API routes, Server Actions).
// NEVER expose this client to the browser.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase Service Key or URL. Admin operations may fail.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
