import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getProgressData,
  saveGameProgress,
  getGameStatistics 
} from '../controllers/progressController.js';

const router = express.Router();

// Get user's progress data (filtered by game type and time frame)
router.get('/', protect, getProgressData);

// Save new game progress data
router.post('/', protect, saveGameProgress);

// Get statistics for specific game
router.get('/stats/:gameType', protect, getGameStatistics);

export default router;