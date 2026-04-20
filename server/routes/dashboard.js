import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total quiz attempts count
    const { count: totalAttempts } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 2. Average score percentage
    const { data: avgData } = await supabaseAdmin
      .from('quiz_attempts')
      .select('score, total')
      .eq('user_id', userId);

    let avgScore = 0;
    if (avgData && avgData.length > 0) {
      const totalScore = avgData.reduce((sum, a) => sum + a.score, 0);
      const totalPossible = avgData.reduce((sum, a) => sum + a.total, 0);
      avgScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 1000) / 10 : 0;
    }

    // 3. Current streak: consecutive days ending today with at least 1 attempt
    let streak = 0;
    if (avgData && avgData.length > 0) {
      const { data: streakData } = await supabaseAdmin
        .from('quiz_attempts')
        .select('attempted_at')
        .eq('user_id', userId)
        .order('attempted_at', { ascending: false });

      if (streakData && streakData.length > 0) {
        const uniqueDays = new Set();
        for (const attempt of streakData) {
          const day = new Date(attempt.attempted_at).toISOString().split('T')[0];
          uniqueDays.add(day);
        }

        const sortedDays = Array.from(uniqueDays).sort().reverse();
        const today = new Date().toISOString().split('T')[0];

        // Check if today or yesterday is in the list to start streak
        let checkDate = new Date(today);
        if (sortedDays[0] !== today) {
          // Check if yesterday counts
          checkDate.setDate(checkDate.getDate() - 1);
          if (sortedDays[0] !== checkDate.toISOString().split('T')[0]) {
            streak = 0;
          } else {
            // Start from yesterday
            streak = 0;
            for (const day of sortedDays) {
              const expected = new Date(today);
              expected.setDate(expected.getDate() - streak - 1);
              if (day === expected.toISOString().split('T')[0]) {
                streak++;
              } else {
                break;
              }
            }
          }
        } else {
          // Start from today
          for (const day of sortedDays) {
            const expected = new Date(today);
            expected.setDate(expected.getDate() - streak);
            if (day === expected.toISOString().split('T')[0]) {
              streak++;
            } else {
              break;
            }
          }
        }
      }
    }

    // 4. Best subject: subject with highest average score (minimum 3 attempts)
    let bestSubject = null;
    if (avgData && avgData.length >= 3) {
      const { data: subjectData } = await supabaseAdmin
        .from('quiz_attempts')
        .select('subject, score, total')
        .eq('user_id', userId);

      if (subjectData) {
        const subjectStats = {};
        for (const attempt of subjectData) {
          if (!attempt.subject) continue;
          if (!subjectStats[attempt.subject]) {
            subjectStats[attempt.subject] = { totalScore: 0, totalPossible: 0, count: 0 };
          }
          subjectStats[attempt.subject].totalScore += attempt.score;
          subjectStats[attempt.subject].totalPossible += attempt.total;
          subjectStats[attempt.subject].count++;
        }

        let bestAvg = 0;
        for (const [subject, stats] of Object.entries(subjectStats)) {
          if (stats.count >= 3) {
            const avg = stats.totalPossible > 0 ? (stats.totalScore / stats.totalPossible) * 100 : 0;
            if (avg > bestAvg) {
              bestAvg = avg;
              bestSubject = { subject, avgScore: Math.round(avg) };
            }
          }
        }
      }
    }

    // 5. Last 10 attempts ordered by date descending
    const { data: recentAttempts } = await supabaseAdmin
      .from('quiz_attempts')
      .select('id, subject, chapter, chapter_name, score, total, attempted_at')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(10);

    // 6. Weak topics: subjects+chapters where avg score < 60%, min 2 attempts
    let weakTopics = [];
    {
      const { data: allAttempts } = await supabaseAdmin
        .from('quiz_attempts')
        .select('subject, chapter, chapter_name, score, total')
        .eq('user_id', userId);

      if (allAttempts) {
        const chapterStats = {};
        for (const attempt of allAttempts) {
          const key = `${attempt.subject}__${attempt.chapter}`;
          if (!chapterStats[key]) {
            chapterStats[key] = {
              subject: attempt.subject,
              chapter: attempt.chapter,
              chapter_name: attempt.chapter_name,
              totalScore: 0,
              totalPossible: 0,
              count: 0,
            };
          }
          chapterStats[key].totalScore += attempt.score;
          chapterStats[key].totalPossible += attempt.total;
          chapterStats[key].count++;
        }

        weakTopics = Object.values(chapterStats)
          .filter((s) => s.count >= 2)
          .map((s) => ({
            subject: s.subject,
            chapter: s.chapter_name || `Chapter ${s.chapter}`,
            avgScore: s.totalPossible > 0 ? Math.round((s.totalScore / s.totalPossible) * 100) : 0,
            count: s.count,
          }))
          .filter((s) => s.avgScore < 60)
          .sort((a, b) => a.avgScore - b.avgScore);
      }
    }

    // 7. Calendar data: all attempt dates in current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data: calendarData } = await supabaseAdmin
      .from('quiz_attempts')
      .select('attempted_at')
      .eq('user_id', userId)
      .gte('attempted_at', startOfMonth)
      .lte('attempted_at', endOfMonth);

    const calendarDays = [];
    if (calendarData) {
      const uniqueDays = new Set();
      for (const attempt of calendarData) {
        const day = new Date(attempt.attempted_at).getDate();
        uniqueDays.add(day);
      }
      calendarDays.push(...uniqueDays);
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, class, subjects')
      .eq('id', userId)
      .single();

    return res.json({
      profile: profile || null,
      totalAttempts: totalAttempts || 0,
      avgScore,
      streak,
      bestSubject,
      recentAttempts: recentAttempts || [],
      weakTopics,
      calendarDays,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: true, message: 'Something went wrong. Please refresh the page.' });
  }
});

export default router;
