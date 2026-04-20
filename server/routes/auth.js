import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, class: userClass, subjects } = req.body;

    if (!email || !password || !full_name || !userClass || !subjects) {
      return res.status(400).json({
        error: true,
        message: 'All fields are required: email, password, full_name, class, subjects',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          class: String(userClass),
          subjects,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: true, message: error.message });
    }

    return res.json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: true, message: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required.' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: true, message: error.message });
    }

    return res.json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: true, message: 'Something went wrong. Please try again.' });
  }
});

export default router;
