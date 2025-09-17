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
import { PythonShell } from 'python-shell';
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

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- CONNECT TO DB ----------
connectDB();

// ---------- MIDDLEWARE ----------
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

// Serve static uploads
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

// ---------- MULTER SETUP FOR AUDIO UPLOAD ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/audio';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `audio-${uniqueSuffix}.wav`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/wav' || file.mimetype === 'audio/x-wav') {
      cb(null, true);
    } else {
      cb(new Error('Only WAV audio files are allowed'), false);
    }
  }
});

// ---------- ROUTES ----------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/analysis', analysisRoutes);

// ---------- DYSELXIA ROUTE WITH AUDIO UPLOAD ----------
// app.post("/api/dyslexia/run", upload.single('audio'), (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
//     if (!req.body.sentence) {
//       fs.unlinkSync(req.file.path);
//       return res.status(400).json({ error: 'No sentence provided' });
//     }

//     const audioFilePath = req.file.path;
//     const sentence = req.body.sentence;

//     const options = {
//       pythonPath: "venv\\Scripts\\python.exe",
//       //pythonPath: "python", //this is for windows. for macOS use /usr/bin/python3
//       scriptPath: path.join(__dirname, "dyslexia"),
//       args: [audioFilePath, `"${sentence}"`]
//     };

//     PythonShell.run("dyslexia.py", options, (err, results) => {
//       // Cleanup uploaded file
//       try {
//         fs.unlinkSync(audioFilePath);
//       } catch (cleanupErr) {
//         console.error('Error cleaning up audio file:', cleanupErr);
//       }

//       if (err) {
//         console.error("Python Error:", err);
//         return res.status(500).json({ error: err.message });
//       }

//       try {
//         const output = results.join('\n');
//         let userSpeech = '';
//         let accuracy = 0;
//         let suggestion = '';

//         const userSpeechMatch = output.match(/🗣️ User said: (.*)/);
//         if (userSpeechMatch) userSpeech = userSpeechMatch[1];

//         const accuracyMatch = output.match(/✅ Accuracy: (\d+)%/);
//         if (accuracyMatch) accuracy = parseInt(accuracyMatch[1]);

//         const suggestionMatch = output.match(/(🔴|🟠|🟢) (.*)/);
//         if (suggestionMatch) suggestion = suggestionMatch[2];

//         res.json({
//           user_speech: userSpeech,
//           accuracy: accuracy,
//           suggestion: suggestion,
//           status: userSpeech ? 'success' : 'error'
//         });
//       } catch (parseErr) {
//         console.error('Error parsing Python output:', parseErr);
//         res.json({ output: results.join('\n') });
//       }
//     });
//   } catch (error) {
//     console.error('Server error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// ---------- ERROR HANDLING ----------
app.use(handleUploadErrors);
app.use(errorHandler);

// ---------- START SERVER ----------
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});