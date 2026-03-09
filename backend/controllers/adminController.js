// backend/controllers/adminController.js
import User from '../models/User.js';
import GameProgress from '../models/GameProgress.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

// @route GET /api/admin/children
// @desc Get all children with their progress stats
// @access Private (Admin only)
export const getAllChildren = asyncHandler(async (req, res) => {
  // Get all non-admin users
  const users = await User.find({ isAdmin: { $ne: true } })
    .select('name email birthDate')
    .lean();

  // For each user, get their game progress
  const childrenWithStats = await Promise.all(
    users.map(async (user) => {
      // Get all sessions for this user
      const sessions = await GameProgress.find({ userId: user._id })
        .select('gameType date')
        .lean();

      // Calculate age
      let age = null;
      if (user.birthDate) {
        const birth = new Date(user.birthDate);
        const today = new Date();
        age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      }

      // Get unique games played
      const gamesPlayed = [...new Set(sessions.map(s => s.gameType))];

      // Get last active date
      const lastActive = sessions.length > 0
        ? sessions.reduce((latest, s) => 
            new Date(s.date) > new Date(latest) ? s.date : latest, 
            sessions[0].date
          )
        : user.createdAt || new Date();

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        age: age,
        totalSessions: sessions.length,
        gamesPlayed: gamesPlayed,
        lastActive: lastActive,
      };
    })
  );

  // Calculate platform stats
  const totalSessions = childrenWithStats.reduce((sum, child) => sum + child.totalSessions, 0);
  
  // Find most played game
  const allSessions = await GameProgress.find().select('gameType').lean();
  const gameCount = {};
  allSessions.forEach(s => {
    gameCount[s.gameType] = (gameCount[s.gameType] || 0) + 1;
  });
  const mostPlayedGame = Object.keys(gameCount).length > 0
    ? Object.entries(gameCount).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  const platformStats = {
    totalChildren: childrenWithStats.length,
    totalSessions: totalSessions,
    mostPlayedGame: mostPlayedGame,
  };

  res.json({
    success: true,
    platformStats,
    children: childrenWithStats,
  });
});

// @route GET /api/admin/children/:childId/progress
// @desc Get detailed progress for a specific child
// @access Private (Admin only)
export const getChildProgress = asyncHandler(async (req, res) => {
  const { childId } = req.params;
  const { limit = 100 } = req.query;

  // Get all sessions for this child
  const sessions = await GameProgress.find({ userId: childId })
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .lean();

  res.json({
    success: true,
    sessions: sessions,
  });
});