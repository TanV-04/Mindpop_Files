import express, { response } from 'express';
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
import corsOptions from './config/corsOptions.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { logger } from './utils/logger.js';
import { handleUploadErrors } from './middleware/uploadMiddleware.js';
import { OpenAI } from 'openai';

// Load environment variables early in the application
dotenv.config();

const app = express();

// Get directory name using ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Connect to MongoDB
connectDB();

// Enhanced CORS configuration - add your frontend URL with correct port
const corsMiddleware = cors({
  origin: ["http://localhost:5173", "http://localhost:3000"], // Add all your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Apply CORS globally
app.use(corsMiddleware);

// Add specific headers to disable resource policy restrictions
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin resource sharing
}));
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(express.json({ limit: '10kb' })); // Body parser with size limit

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Initialize OpenAI with API key from environment variables
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.error('OpenAI API key is not defined in environment variables');
    throw new Error('OpenAI API key is missing');
  }
  
  openai = new OpenAI({
    apiKey: apiKey
  });
  
  logger.info('OpenAI client initialized successfully');
} catch (error) {
  logger.error(`Error initializing OpenAI client: ${error.message}`);
}

// Route to generate image
app.post('/api/generate-image', async (req, res) => {
  try {
    // Check if OpenAI client is properly initialized
    if (!openai.apiKey) {
      logger.error('OpenAI client not initialized');
      return res.status(500).json({ error: 'OpenAI client not properly initialized' });
    }

    const { prompt } = req.body;

    if (!prompt) {
      logger.error('Missing prompt in request body');
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Ensure the prompt meets OpenAI guidelines (not too short)
    if (prompt.length < 10) {
      return res.status(400).json({ error: 'Prompt must be at least 10 characters long' });
    }

    logger.info(`Generating image with prompt: ${prompt}`);

    try {
      const result = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a child-friendly, colorful image for a jigsaw puzzle: ${prompt}`,
        size: "1024x1024",
        quality: "standard",
        n: 1,
        response_format: "url"
      });

      if (!result || !result.data || !result.data[0] || !result.data[0].url) {
        logger.error('Invalid response from OpenAI API');
        return res.status(500).json({ error: 'Failed to generate image (invalid response format)' });
      }

      const imageUrl = result.data[0].url;
      logger.info('Image generated successfully');

      return res.json({ output: imageUrl });
    } catch (openaiError) {
      logger.error(`OpenAI API error: ${JSON.stringify(openaiError)}`);
      return res.status(500).json({ 
        error: `OpenAI API error: ${openaiError.message || 'Unknown error'}`,
        details: openaiError.response?.data || openaiError.message
      });
    }
  } catch (error) {
    logger.error(`Error in image generation route: ${error.message}`);
    // Send more detailed error info for debugging
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/support', supportRoutes);

// Handle file upload errors
app.use(handleUploadErrors);

// Error handling middleware should be the last one
app.use(errorHandler);

const PORT = process.env.PORT || 8001; // Make sure this matches the port your frontend is calling
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});