import { supabaseAdmin } from '../../server/lib/supabase.js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Guest rate limiting (per-invocation, will reset on cold starts)
const guestMessageCounts = new Map();

async function getEmbedding(text) {
  const response = await fetch(
    'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
    }
  );
  if (!response.ok) return null;
  return await response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method not allowed' });
  }

  try {
    const { message, subject, class: userClass, chapter, conversationHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: true, message: 'Message is required.' });
    }

    // Auth check
    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data } = await supabaseAdmin.auth.getUser(token);
      user = data?.user || null;
    }

    // Guest limit
    if (!user) {
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      const count = guestMessageCounts.get(ip) || 0;
      if (count >= 2) {
        return res.status(429).json({ error: true, message: 'Sign up to continue!' });
      }
      guestMessageCounts.set(ip, count + 1);
    }

    // Build context
    let context = '';
    let chapterName = '';
    if (subject && userClass) {
      try {
        const embedding = await getEmbedding(message);
        if (embedding) {
          const { data: docs } = await supabaseAdmin.rpc('match_documents', {
            query_embedding: `[${embedding.join(',')}]`,
            match_count: 5,
            filter_class: parseInt(userClass),
            filter_subject: subject,
            filter_chapter: chapter ? parseInt(chapter) : null,
          });
          if (docs?.length > 0) {
            context = docs.map(d => d.content).join('\n\n---\n\n');
            chapterName = docs[0].chapter_name || `Chapter ${chapter}`;
          }
        }
      } catch (e) { /* continue without context */ }
    }

    let systemPrompt = context
      ? `You are an AI tutor for CBSE Class ${userClass} students.\nAnswer using ONLY the NCERT content below.\nSubject: ${subject}. Chapter: ${chapterName}.\nIf the answer is not found, say so.\n\nNCERT Content:\n${context}`
      : 'You are NCERT Buddy, a helpful AI tutor for Indian students in Classes 9-12. Answer doubts based on NCERT textbooks. Be concise, accurate, and encouraging.';

    const messages = [{ role: 'system', content: systemPrompt }];
    if (conversationHistory?.length) {
      for (const msg of conversationHistory.slice(-6)) {
        messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content || msg.text });
      }
    }
    messages.push({ role: 'user', content: message });

    // Stream via SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';
    const chatCompletion = await groq.chat.completions.create({
      messages, model: 'llama-3.3-70b-versatile', temperature: 0.6, max_tokens: 1024, stream: true,
    });

    for await (const chunk of chatCompletion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    if (user && fullResponse) {
      await supabaseAdmin.from('chat_history').insert([
        { user_id: user.id, role: 'user', content: message, subject, chapter: chapter ? String(chapter) : null },
        { user_id: user.id, role: 'assistant', content: fullResponse, subject, chapter: chapter ? String(chapter) : null },
      ]).catch(() => {});
    }
  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).json({ error: true, message: 'Our AI is taking a short break. Please try again.' });
    }
    res.end();
  }
}
