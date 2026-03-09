// server.js
// ─── IMPORTS ──────────────────────────────────────────────────────────
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import adminRoutes from './routes/adminRoutes.js';

// ─── DB ───────────────────────────────────────────────────────────────
import { connectDB } from './config/database.js';

// ─── ROUTES ───────────────────────────────────────────────────────────
import authRoutes     from './routes/authRoutes.js';
import userRoutes     from './routes/userRoute.js';
import progressRoutes from './routes/progressRoutes.js';
import supportRoutes  from './routes/supportRoutes.js';
// NOTE: analysisRoutes and dyslexia routes removed – out of scope

// ─── MIDDLEWARE ───────────────────────────────────────────────────────
import { errorHandler }      from './middleware/errorMiddleware.js';
import { logger }            from './utils/logger.js';
import { handleUploadErrors } from './middleware/uploadMiddleware.js';

// ─── SETUP ────────────────────────────────────────────────────────────
dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── DATABASE ─────────────────────────────────────────────────────────
connectDB();

// ─── CORS ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── SECURITY ─────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' }));

// Cross-origin headers for static assets
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// ─── STATIC FILES ─────────────────────────────────────────────────────
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// ─── RATE LIMITING ────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // bumped for progress saves during gameplay
  message: 'Too many requests, please try again later.',
});
app.use('/api', apiLimiter);

// ─── OPENAI (Jigsaw image generation) ────────────────────────────────
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key is missing');
  openai = new OpenAI({ apiKey });
  logger.info('OpenAI client initialized');
} catch (error) {
  logger.error(`OpenAI init error: ${error.message}`);
}

app.post('/api/generate-image', async (req, res) => {
  try {
    if (!openai?.apiKey) {
      return res.status(500).json({ error: 'OpenAI client not initialized' });
    }
    const { prompt } = req.body;
    if (!prompt || prompt.length < 10) {
      return res.status(400).json({ error: 'Prompt must be at least 10 characters' });
    }

    const result = await openai.images.generate({
      model:           'dall-e-3',
      prompt:          `Create a child-friendly, colorful jigsaw puzzle image: ${prompt}`,
      size:            '1024x1024',
      quality:         'standard',
      n:               1,
      response_format: 'url',
    });

    const imageUrl = result.data[0]?.url;
    if (!imageUrl) throw new Error('Failed to generate image');

    res.json({ output: imageUrl });
  } catch (error) {
    logger.error(`Image generation error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ─── API ROUTES ───────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/support',  supportRoutes);
app.use('/api/admin', adminRoutes);

// ─── ERROR HANDLING ───────────────────────────────────────────────────
app.use(handleUploadErrors);
app.use(errorHandler);

// ─── START ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  logger.info(`🧠 MindPop server running on port ${PORT}`);
});
