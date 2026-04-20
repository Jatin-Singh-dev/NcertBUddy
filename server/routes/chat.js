import { Router } from 'express';
import Groq from 'groq-sdk';
import { supabaseAdmin } from '../lib/supabase.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// In-memory guest rate limiting (reset on server restart)
const guestMessageCounts = new Map();

// Get embedding from HuggingFace
async function getEmbedding(text) {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
    }
  );

  if (!response.ok) {
    console.error('HuggingFace API error:', response.status, await response.text());
    return null;
  }

  const embedding = await response.json();
  return embedding;
}


// Search documents by vector similarity
async function searchDocuments(queryEmbedding, userClass, subject, chapter) {
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  let query = supabaseAdmin.rpc('match_documents', {
    query_embedding: embeddingStr,
    match_count: 5,
    filter_class: userClass,
    filter_subject: subject,
    filter_chapter: chapter || null,
  });

  const { data, error } = await query;

  if (error) {
    console.error('Vector search error:', error);
    // Fallback: text-based search
    const fallback = await supabaseAdmin
      .from('documents')
      .select('content')
      .eq('class', userClass)
      .eq('subject', subject)
      .limit(5);
    return fallback.data || [];
  }

  return data || [];
}

// POST /api/chat
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { message, subject, class: userClass, chapter, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: true, message: 'Message is required.' });
    }

    // Guest rate limiting
    if (!req.user) {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const count = guestMessageCounts.get(ip) || 0;
      if (count >= 2) {
        return res.status(429).json({
          error: true,
          message: 'You have used your 2 free questions. Sign up to continue!',
        });
      }
      guestMessageCounts.set(ip, count + 1);
    }

    // Build context from RAG if subject and class provided
    let context = '';
    let chapterName = '';

    if (subject && userClass) {
      try {
        const embedding = await getEmbedding(message);
        if (embedding) {
          const docs = await searchDocuments(embedding, userClass, subject, chapter);
          if (docs.length > 0) {
            context = docs.map((d) => d.content).join('\n\n---\n\n');
            chapterName = docs[0].chapter_name || `Chapter ${chapter}`;
          }
        }
      } catch (embeddingErr) {
        console.error('Embedding/search error:', embeddingErr);
        // Continue without RAG context
      }
    }

    // Build system prompt
    let systemPrompt;
    if (context) {
      systemPrompt = `You are an AI tutor for CBSE Class ${userClass} students.
Answer questions ONLY using the NCERT textbook content provided below.
Subject: ${subject}. Chapter: ${chapterName}.
If the answer is not in the provided content, say:
"I could not find this in the NCERT content for this chapter. Please check your textbook or try a different chapter."
Always end your answer with: Source: NCERT Class ${userClass} ${subject}, Chapter ${chapter}.

NCERT Content:
${context}`;
    } else if (subject && userClass) {
      systemPrompt = `You are an AI tutor for CBSE Class ${userClass} students studying ${subject}.
Answer the student's question clearly and accurately based on NCERT curriculum.
Be direct and confident. Do NOT add any disclaimers, warnings, or suggestions to check the textbook.
Do NOT say "this is a general answer". Just answer the question directly.`;
    } else {
      systemPrompt = `You are NCERT Buddy, a helpful AI tutor for Indian students in Classes 9-12.
Answer doubts based on NCERT textbooks. Be concise, accurate, and encouraging.
Do NOT add any disclaimers, warnings, or suggestions to check the textbook.
If a question is outside the scope of NCERT or Classes 9-12, politely mention that you specialize in NCERT curriculum.`;
    }

    // Build messages array
    const messages = [{ role: 'system', content: systemPrompt }];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-6)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content || msg.text,
        });
      }
    }

    messages.push({ role: 'user', content: message });

    // Stream response via SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        max_tokens: 1024,
        stream: true,
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

      // Save to chat_history if authenticated
      if (req.user && fullResponse) {
        try {
          await supabaseAdmin.from('chat_history').insert([
            {
              user_id: req.user.id,
              role: 'user',
              content: message,
              subject: subject || null,
              chapter: chapter ? String(chapter) : null,
            },
            {
              user_id: req.user.id,
              role: 'assistant',
              content: fullResponse,
              subject: subject || null,
              chapter: chapter ? String(chapter) : null,
            },
          ]);
        } catch (saveErr) {
          console.error('Error saving chat history:', saveErr);
        }
      }
    } catch (groqErr) {
      console.error('Groq API error:', groqErr);
      res.write(
        `data: ${JSON.stringify({
          content: 'Our AI is taking a short break. Please try again in a moment.',
          done: true,
        })}\n\n`
      );
      res.end();
    }
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: true,
        message: 'Something went wrong. Please refresh the page.',
      });
    }
    res.end();
  }
});

export default router;
