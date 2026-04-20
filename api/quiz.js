import { supabaseAdmin } from '../../server/lib/supabase.js';

async function getUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const { data } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
  return data?.user || null;
}

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGetQuiz(req, res);
  if (req.method === 'POST') return handleSubmitQuiz(req, res);
  return res.status(405).json({ error: true, message: 'Method not allowed' });
}

async function handleGetQuiz(req, res) {
  try {
    const { class: userClass, subject, chapter } = req.query;
    if (!userClass || !subject) {
      return res.status(400).json({ error: true, message: 'class and subject required.' });
    }

    let query = supabaseAdmin
      .from('quiz_questions')
      .select('id, question, option_a, option_b, option_c, option_d, chapter, chapter_name')
      .eq('class', parseInt(userClass))
      .eq('subject', subject);

    if (chapter) query = query.eq('chapter', parseInt(chapter));
    const { data, error } = await query;

    if (error) return res.status(500).json({ error: true, message: 'Failed to load questions.' });
    if (!data?.length) return res.json({ questions: [], message: 'No questions available.' });

    const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 10);
    return res.json({ questions: shuffled });
  } catch (err) {
    return res.status(500).json({ error: true, message: 'Something went wrong.' });
  }
}

async function handleSubmitQuiz(req, res) {
  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: true, message: 'Authentication required.' });

    const { answers, class: userClass, subject, chapter, chapter_name } = req.body;
    if (!answers?.length) return res.status(400).json({ error: true, message: 'Answers required.' });

    const questionIds = answers.map(a => a.question_id);
    const { data: questions } = await supabaseAdmin.from('quiz_questions')
      .select('id, correct_answer, explanation').in('id', questionIds);

    const correctMap = {};
    for (const q of (questions || [])) correctMap[q.id] = q;

    let score = 0;
    const correctAnswers = answers.map(a => {
      const correct = correctMap[a.question_id];
      const isCorrect = correct?.correct_answer === a.selected_option;
      if (isCorrect) score++;
      return {
        question_id: a.question_id, correct_option: correct?.correct_answer,
        selected_option: a.selected_option, is_correct: isCorrect,
        explanation: correct?.explanation,
      };
    });

    await supabaseAdmin.from('quiz_attempts').insert({
      user_id: user.id, class: userClass ? parseInt(userClass) : null,
      subject, chapter: chapter ? parseInt(chapter) : null, chapter_name,
      score, total: answers.length, answers_json: correctAnswers,
    }).catch(() => {});

    return res.json({ score, total: answers.length, percentage: Math.round((score / answers.length) * 100), correct_answers: correctAnswers });
  } catch (err) {
    return res.status(500).json({ error: true, message: 'Something went wrong.' });
  }
}
