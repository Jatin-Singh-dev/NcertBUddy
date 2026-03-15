import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Admin client — bypasses RLS
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

// Create a user-scoped client from their JWT
export const createUserClient = (accessToken) => {
  return createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
};
