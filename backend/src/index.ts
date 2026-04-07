import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { apiLimiter } from './middleware';
import { errorMiddleware, notFoundMiddleware } from './middleware';
import {
  authRoutes,
  scenarioRoutes,
  conversationRoutes,
  speechRoutes,
  reviewRoutes,
  progressRoutes,
} from './routes';

const app = express();

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: config.nodeEnv,
  });
});

app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/scenarios', apiLimiter, scenarioRoutes);
app.use('/api/conversations', apiLimiter, conversationRoutes);
app.use('/api/speech', apiLimiter, speechRoutes);
app.use('/api/reviews', apiLimiter, reviewRoutes);
app.use('/api/progress', apiLimiter, progressRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║         ESL Speak Backend Server                  ║
╠═══════════════════════════════════════════════════╣
║  Status:  ✅ Running                              ║
║  Port:    ${String(config.port).padEnd(37)}║
║  Env:     ${config.nodeEnv.padEnd(37)}║
║  MongoDB: ✅ Connected                            ║
║  Gemini:  ${config.geminiApiKey ? '✅ Configured' : '⚠️  Not configured'.padEnd(37)}║
╚═══════════════════════════════════════════════════╝

API Endpoints:
  POST /api/auth/register    - Register new user
  POST /api/auth/login       - Login user
  GET  /api/auth/me          - Get current user
  GET  /api/scenarios        - List scenarios
  GET  /api/scenarios/:id    - Get scenario details
  POST /api/conversations    - Start conversation
  POST /api/conversations/:id/messages - Send message
  POST /api/speech/analyze   - Analyze speech
  GET  /api/progress         - Get progress
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
