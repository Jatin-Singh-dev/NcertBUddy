import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/papers?class=10&type=sample
router.get('/', requireAuth, async (req, res) => {
  try {
    const { class: userClass, type } = req.query;

    let query = supabaseAdmin
      .from('papers')
      .select('id, class, subject, year, type, filename, file_size_kb')
      .order('year', { ascending: false });

    if (userClass) {
      query = query.eq('class', parseInt(userClass));
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Papers fetch error:', error);
      return res.status(500).json({ error: true, message: 'Failed to load papers.' });
    }

    // Generate signed URLs for each paper
    const papers = [];
    for (const paper of data || []) {
      let downloadUrl = null;
      if (paper.filename) {
        const { data: urlData, error: urlError } = await supabaseAdmin.storage
          .from('papers')
          .createSignedUrl(paper.filename, 60); // 60 seconds expiry

        if (!urlError && urlData) {
          downloadUrl = urlData.signedUrl;
        }
      }

      papers.push({
        id: paper.id,
        class: paper.class,
        subject: paper.subject,
        year: paper.year,
        type: paper.type,
        file_size_kb: paper.file_size_kb,
        download_url: downloadUrl,
      });
    }

    return res.json({ papers });
  } catch (err) {
    console.error('Papers error:', err);
    return res.status(500).json({ error: true, message: 'Something went wrong. Please try again.' });
  }
});

export default router;
