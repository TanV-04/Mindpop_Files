// ---------- IMPORTS ----------
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import { PythonShell } from 'python-shell';
import OpenAI from 'openai';

// ---------- ROUTES ----------
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoute.js';
import progressRoutes from './routes/progressRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';

// ---------- MIDDLEWARE ----------
import corsOptions from './config/corsOptions.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { logger } from './utils/logger.js';
import { handleUploadErrors } from './middleware/uploadMiddleware.js';

// ---------- INITIAL SETUP ----------
dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- CONNECT TO DB ----------
connectDB();

// ---------- SECURITY & GLOBAL MIDDLEWARE ----------
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' }));

// ---------- STATIC FILES ----------
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ---------- RATE LIMITING ----------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// ---------- OPENAI SETUP ----------
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key is missing');
  openai = new OpenAI({ apiKey });
  logger.info('OpenAI client initialized successfully');
} catch (error) {
  logger.error(`Error initializing OpenAI client: ${error.message}`);
}

// ---------- OPENAI IMAGE GENERATION ----------
app.post('/api/generate-image', async (req, res) => {
  try {
    if (!openai?.apiKey) {
      logger.error('OpenAI client not initialized');
      return res.status(500).json({ error: 'OpenAI client not properly initialized' });
    }

    const { prompt } = req.body;

    if (!prompt || prompt.length < 10) {
      return res.status(400).json({ error: 'Prompt must be at least 10 characters long' });
    }

    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a child-friendly, colorful image for a jigsaw puzzle: ${prompt}`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
      response_format: "url"
    });

    const imageUrl = result.data[0]?.url;
    if (!imageUrl) throw new Error('Failed to generate image');

    res.json({ output: imageUrl });
  } catch (error) {
    logger.error(`Image generation error: ${error.message}`);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ---------- API ROUTES ----------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/analysis', analysisRoutes);

// ---------- ERROR HANDLING ----------
app.use(handleUploadErrors);
app.use(errorHandler);

// ---------- START SERVER ----------
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});