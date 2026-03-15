import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local
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
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Routes
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

app.listen(PORT, () => {
  console.log(`✅ NCERT Buddy API server running on http://localhost:${PORT}`);
});

export default app;
