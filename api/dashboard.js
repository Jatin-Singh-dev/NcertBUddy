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
    const userId = user.id;

    const [attemptsRes, profileRes] = await Promise.all([
      supabaseAdmin.from('quiz_attempts').select('*').eq('user_id', userId).order('attempted_at', { ascending: false }),
      supabaseAdmin.from('profiles').select('full_name, class, subjects').eq('id', userId).single(),
    ]);

    const allAttempts = attemptsRes.data || [];
    const profile = profileRes.data;

    const totalAttempts = allAttempts.length;
    const totalScore = allAttempts.reduce((s, a) => s + a.score, 0);
    const totalPossible = allAttempts.reduce((s, a) => s + a.total, 0);
    const avgScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 1000) / 10 : 0;

    // Streak
    let streak = 0;
    const uniqueDays = [...new Set(allAttempts.map(a => new Date(a.attempted_at).toISOString().split('T')[0]))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    if (uniqueDays.length > 0) {
      let checkDate = new Date(today);
      if (uniqueDays[0] !== today) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (uniqueDays[0] === checkDate.toISOString().split('T')[0]) {
          for (const day of uniqueDays) {
            const expected = new Date(today);
            expected.setDate(expected.getDate() - streak - 1);
            if (day === expected.toISOString().split('T')[0]) streak++;
            else break;
          }
        }
      } else {
        for (const day of uniqueDays) {
          const expected = new Date(today);
          expected.setDate(expected.getDate() - streak);
          if (day === expected.toISOString().split('T')[0]) streak++;
          else break;
        }
      }
    }

    // Best subject
    let bestSubject = null;
    const subjectStats = {};
    for (const a of allAttempts) {
      if (!a.subject) continue;
      if (!subjectStats[a.subject]) subjectStats[a.subject] = { s: 0, t: 0, c: 0 };
      subjectStats[a.subject].s += a.score;
      subjectStats[a.subject].t += a.total;
      subjectStats[a.subject].c++;
    }
    let bestAvg = 0;
    for (const [subj, stats] of Object.entries(subjectStats)) {
      if (stats.c >= 3 && stats.t > 0) {
        const avg = (stats.s / stats.t) * 100;
        if (avg > bestAvg) { bestAvg = avg; bestSubject = { subject: subj, avgScore: Math.round(avg) }; }
      }
    }

    // Weak topics
    const chapterStats = {};
    for (const a of allAttempts) {
      const key = `${a.subject}__${a.chapter}`;
      if (!chapterStats[key]) chapterStats[key] = { subject: a.subject, chapter: a.chapter, chapter_name: a.chapter_name, s: 0, t: 0, c: 0 };
      chapterStats[key].s += a.score; chapterStats[key].t += a.total; chapterStats[key].c++;
    }
    const weakTopics = Object.values(chapterStats)
      .filter(s => s.c >= 2 && s.t > 0 && (s.s / s.t) * 100 < 60)
      .map(s => ({ subject: s.subject, chapter: s.chapter_name || `Chapter ${s.chapter}`, avgScore: Math.round((s.s / s.t) * 100) }))
      .sort((a, b) => a.avgScore - b.avgScore);

    // Calendar
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const calendarDays = [...new Set(
      allAttempts
        .filter(a => a.attempted_at >= monthStart && a.attempted_at <= monthEnd)
        .map(a => new Date(a.attempted_at).getDate())
    )];

    return res.json({
      profile, totalAttempts, avgScore, streak, bestSubject,
      recentAttempts: allAttempts.slice(0, 10), weakTopics, calendarDays,
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: 'Something went wrong.' });
  }
}
