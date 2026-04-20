import { supabaseAdmin } from '../../server/lib/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'POST' && req.url?.includes('/signup')) {
    return handleSignup(req, res);
  }
  if (req.method === 'POST' && req.url?.includes('/login')) {
    return handleLogin(req, res);
  }
  return res.status(404).json({ error: true, message: 'Not found' });
}

async function handleSignup(req, res) {
  try {
    const { email, password, full_name, class: userClass, subjects } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password required.' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name, class: String(userClass), subjects } },
    });

    if (error) return res.status(400).json({ error: true, message: error.message });
    return res.json({ success: true, user: data.user, session: data.session });
  } catch (err) {
    return res.status(500).json({ error: true, message: 'Something went wrong.' });
  }
}

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password required.' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: true, message: error.message });
    return res.json({ success: true, user: data.user, session: data.session });
  } catch (err) {
    return res.status(500).json({ error: true, message: 'Something went wrong.' });
  }
}
