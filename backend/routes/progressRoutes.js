// routes/progressRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProgressData,
  saveGameProgress,
  getGameStatistics,
  getAdminProgressOverview,
  getChildProgressDetail,
} from '../controllers/progressController.js';

const router = express.Router();

// ─── Child Routes ─────────────────────────────────────────────────────
// POST /api/progress        – save one game session
router.post('/', protect, saveGameProgress);

// GET  /api/progress        – dashboard data (filtered by game + timeframe)
router.get('/', protect, getProgressData);

// GET  /api/progress/stats/:gameType – detailed stats for one game
router.get('/stats/:gameType', protect, getGameStatistics);

// ─── Admin Routes ─────────────────────────────────────────────────────
// GET  /api/progress/admin/all            – all children overview
router.get('/admin/all', protect, getAdminProgressOverview);

// GET  /api/progress/admin/child/:childId – one child's full history
router.get('/admin/child/:childId', protect, getChildProgressDetail);

export default router;
