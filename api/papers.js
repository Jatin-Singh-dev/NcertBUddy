import { supabaseAdmin } from '../../server/lib/supabase.js';

async function getUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const { data } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
  return data?.user || null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: true, message: 'Method not allowed' });

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: true, message: 'Authentication required.' });

  try {
    const { class: userClass, type } = req.query;

    let query = supabaseAdmin.from('papers')
      .select('id, class, subject, year, type, filename, file_size_kb')
      .order('year', { ascending: false });

    if (userClass) query = query.eq('class', parseInt(userClass));
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: true, message: 'Failed to load papers.' });

    const papers = [];
    for (const paper of (data || [])) {
      let downloadUrl = null;
      if (paper.filename) {
        const { data: urlData } = await supabaseAdmin.storage
          .from('papers').createSignedUrl(paper.filename, 60);
        downloadUrl = urlData?.signedUrl || null;
      }
      papers.push({ id: paper.id, class: paper.class, subject: paper.subject, year: paper.year, type: paper.type, file_size_kb: paper.file_size_kb, download_url: downloadUrl });
    }

    return res.json({ papers });
  } catch (err) {
    return res.status(500).json({ error: true, message: 'Something went wrong.' });
  }
}
