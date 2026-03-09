// backend/routes/adminRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getAllChildren, getChildProgress } from '../controllers/adminController.js';

const router = express.Router();

// Both routes require authentication AND admin privileges
router.get('/children', protect, admin, getAllChildren);
router.get('/children/:childId/progress', protect, admin, getChildProgress);

export default router;