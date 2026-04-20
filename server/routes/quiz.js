import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/quiz?class=10&subject=Science&chapter=8
router.get('/', async (req, res) => {
  try {
    const { class: userClass, subject, chapter } = req.query;

    if (!userClass || !subject) {
      return res.status(400).json({
        error: true,
        message: 'class and subject query parameters are required.',
      });
    }

    let query = supabaseAdmin
      .from('quiz_questions')
      .select('id, question, option_a, option_b, option_c, option_d, chapter, chapter_name')
      .eq('class', parseInt(userClass))
      .eq('subject', subject);

    if (chapter) {
      query = query.eq('chapter', parseInt(chapter));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Quiz fetch error:', error);
      return res.status(500).json({ error: true, message: 'Failed to load quiz questions.' });
    }

    if (!data || data.length === 0) {
      return res.json({ questions: [], message: 'No questions available for this selection yet.' });
    }

    // Shuffle and pick up to 10 random questions
    const shuffled = data.sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, 10);

    // Do NOT include correct_answer or explanation — prevents cheating
    return res.json({ questions });
  } catch (err) {
    console.error('Quiz error:', err);
    return res.status(500).json({ error: true, message: 'Something went wrong. Please try again.' });
  }
});

// POST /api/quiz/submit
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const { answers, class: userClass, subject, chapter, chapter_name } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: true, message: 'Answers array is required.' });
    }

    // Fetch correct answers for submitted question IDs
    const questionIds = answers.map((a) => a.question_id);

    const { data: questions, error } = await supabaseAdmin
      .from('quiz_questions')
      .select('id, correct_answer, explanation')
      .in('id', questionIds);

    if (error) {
      console.error('Quiz submit fetch error:', error);
      return res.status(500).json({ error: true, message: 'Failed to validate answers.' });
    }

    // Build a map of correct answers
    const correctMap = {};
    for (const q of questions) {
      correctMap[q.id] = { correct_answer: q.correct_answer, explanation: q.explanation };
    }

    // Calculate score
    let score = 0;
    const correctAnswers = [];

    for (const answer of answers) {
      const correct = correctMap[answer.question_id];
      if (correct) {
        const isCorrect = answer.selected_option === correct.correct_answer;
        if (isCorrect) score++;
        correctAnswers.push({
          question_id: answer.question_id,
          correct_option: correct.correct_answer,
          selected_option: answer.selected_option,
          is_correct: isCorrect,
          explanation: correct.explanation,
        });
      }
    }

    const total = answers.length;

    // Insert quiz attempt
    const { error: insertError } = await supabaseAdmin.from('quiz_attempts').insert({
      user_id: req.user.id,
      class: userClass ? parseInt(userClass) : null,
      subject: subject || null,
      chapter: chapter ? parseInt(chapter) : null,
      chapter_name: chapter_name || null,
      score,
      total,
      answers_json: correctAnswers,
    });

    if (insertError) {
      console.error('Quiz attempt insert error:', insertError);
      // Don't fail the response — return the score even if saving failed
    }

    return res.json({
      score,
      total,
      percentage: Math.round((score / total) * 100),
      correct_answers: correctAnswers,
    });
  } catch (err) {
    console.error('Quiz submit error:', err);
    return res.status(500).json({ error: true, message: 'Something went wrong. Please try again.' });
  }
});

export default router;
