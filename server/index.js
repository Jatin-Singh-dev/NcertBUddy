import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Route imports
import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import dashboardRoutes from './routes/dashboard.js';
import papersRoutes from './routes/papers.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://ncertbuddy.onrender.com',
  ],
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/papers', papersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: true,
    message: 'Something went wrong. Please refresh the page.',
  });
});

// Serve frontend static files
app.use(express.static(join(__dirname, '../dist')));

// Catch-all: send index.html for all non-API routes (React Router)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, '../dist/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`✅ NCERT Buddy API server running on http://localhost:${PORT}`);
});

export default app;
