import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase server credentials missing. Check your .env.local file.');
}

// Server-side client with service role key — bypasses RLS
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

// Create a client scoped to a specific user's JWT (for RLS-respecting queries)
export const createUserClient = (accessToken) => {
  return createClient(
    supabaseUrl || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
};
