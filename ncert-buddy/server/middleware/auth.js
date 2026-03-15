import { supabaseAdmin } from '../lib/supabase.js';

// Middleware to extract and verify user from Authorization header
// Sets req.user and req.accessToken if valid, otherwise continues without them
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.accessToken = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      req.user = null;
      req.accessToken = null;
      return next();
    }

    req.user = user;
    req.accessToken = token;
    next();
  } catch (err) {
    req.user = null;
    req.accessToken = null;
    next();
  }
};

// Middleware that REQUIRES authentication — returns 401 if not authenticated
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: true, message: 'Authentication required. Please log in.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: true, message: 'Invalid or expired session. Please log in again.' });
    }

    req.user = user;
    req.accessToken = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: true, message: 'Authentication failed. Please log in again.' });
  }
};
