import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoute.js';
import progressRoutes from './routes/progressRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';

import corsOptions from './config/corsOptions.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { logger } from './utils/logger.js';
import { handleUploadErrors } from './middleware/uploadMiddleware.js';
import OpenAI from 'openai';
import dyslexiaRoutes from "./routes/dyslexia.js";
import { PythonShell } from "python-shell";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Connect to MongoDB
connectDB();

// CORS configuration
const corsMiddleware = cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
app.use(corsMiddleware);
app.use(cors());
// Security headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' }));

// Serve uploads
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// ✅ OpenAI Setup
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    logger.error('OpenAI API key is not defined in environment variables');
    throw new Error('OpenAI API key is missing');
  }

  openai = new OpenAI({ apiKey });
  logger.info('OpenAI client initialized successfully');
} catch (error) {
  logger.error(`Error initializing OpenAI client: ${error.message}`);
}

// ✅ OpenAI image generation route
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

    logger.info(`Generating image with prompt: ${prompt}`);

    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a child-friendly, colorful image for a jigsaw puzzle: ${prompt}`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
      response_format: "url"
    });

    if (!result?.data?.[0]?.url) {
      logger.error('Invalid response from OpenAI API');
      return res.status(500).json({ error: 'Failed to generate image (invalid response format)' });
    }

    const imageUrl = result.data[0].url;
    logger.info('Image generated successfully');

    return res.json({ output: imageUrl });
  } catch (error) {
    logger.error(`Image generation error: ${error.message}`);
    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/analysis', analysisRoutes);
app.use("/api/dyslexia", dyslexiaRoutes);

// Middleware for file upload errors
app.use(handleUploadErrors);

// Error handler
app.use(errorHandler);

// ✅ Start the server
const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// ---- Dyslexia Test Route ----
app.post("/api/dyslexia/run", (req, res) => {
  const options = {
    pythonPath: "/usr/bin/python3",          // check with `which python3` on your Mac
    scriptPath: path.join(__dirname, "dyslexia"), // folder containing dyslexia.py
  };

  PythonShell.run("dyslexia.py", options, (err, results) => {
    if (err) {
      console.error("Python Error:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("Python Output:", results);
    res.json({ output: results.join("\n") }); // send back full Python output
  });
});