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
import corsOptions from './config/corsOptions.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { logger } from './utils/logger.js';
import { handleUploadErrors } from './middleware/uploadMiddleware.js';
import analysisRoutes from './routes/analysisRoutes.js';

dotenv.config();
const app = express();

// Get directory name using ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Connect to MongoDB
connectDB();

// Enhanced CORS configuration
const corsMiddleware = cors({
  origin: "http://localhost:5173", // Your frontend URL
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/analysis', analysisRoutes);

// Handle file upload errors
app.use(handleUploadErrors);

// Error handling
app.use(errorHandler);

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});