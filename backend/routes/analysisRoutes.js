// routes/analysisRoutes.js
import express from 'express';
import Analysis from '../models/Analysis.js';
import { protect } from '../middleware/authMiddleware.js'; // Ensure you have this middleware

const router = express.Router();

// @route   POST /api/analysis/save
router.post('/save', protect, async (req, res) => {
  try {
    const { originalFilename, results, metadata } = req.body;
    const userId = req.user._id;

    const analysis = new Analysis({
      userId,
      date: new Date(),
      originalFilename,
      results,
      metadata
    });

    const savedAnalysis = await analysis.save();
    res.status(201).json(savedAnalysis);
  } catch (error) {
    console.error('Error saving analysis:', error);
    res.status(500).json({ error: 'Failed to save analysis results' });
  }
});

// @route   GET /api/analysis/history
router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const analyses = await Analysis.find({ userId }).sort({ date: -1 });
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    res.status(500).json({ error: 'Failed to fetch analysis history' });
  }
});

// @route   GET /api/analysis/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

export default router;