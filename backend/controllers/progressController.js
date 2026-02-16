// controllers/progressController.js
// SOLID:
//   Single Responsibility – each exported function handles one concern
//   Open/Closed – new game types can be added via gameHandlers map without touching existing code
//   Dependency Inversion – depends on GameProgress model abstraction, not a concrete DB call

import GameProgress from '../models/GameProgress.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { logger } from '../utils/logger.js';

// ─── Constants ────────────────────────────────────────────────────────
const GAME_BENCHMARKS = {
  seguin:  { standardTime: 80,  label: 'Seguin Form Board' },
  monkey:  { targetWpm: 40,     label: 'Typing Challenge'  },
  jigsaw:  { standardTime: 300, label: 'Jigsaw Puzzle'     },
  balloon: { targetScore: 30,   label: 'Balloon Pop'       },
};

const VALID_GAME_TYPES = Object.keys(GAME_BENCHMARKS);

// ─── Helpers ──────────────────────────────────────────────────────────

const getDateRange = (timeFrame) => {
  const endDate = new Date();
  const startDate = new Date();
  switch (timeFrame) {
    case 'week':  startDate.setDate(startDate.getDate() - 7);          break;
    case 'year':  startDate.setFullYear(startDate.getFullYear() - 1);  break;
    default:      startDate.setMonth(startDate.getMonth() - 1);        // month
  }
  return { startDate, endDate };
};

const calcImprovement = (data, valueKey) => {
  if (data.length < 3) return null;
  const sorted = [...data].sort((a, b) => a.date - b.date);
  const avg = (arr) => arr.reduce((s, e) => s + (e[valueKey] || 0), 0) / arr.length;
  const avgFirst = avg(sorted.slice(0, 3));
  const avgLast  = avg(sorted.slice(-3));
  if (avgFirst === 0) return null;
  // For time-based games, lower is better (positive % = improvement)
  // For score-based games, higher is better (positive % = improvement)
  return Math.round(((avgFirst - avgLast) / avgFirst) * 100);
};

const safeAvg = (arr, key) => {
  if (!arr.length) return null;
  const sum = arr.reduce((s, e) => s + (e[key] || 0), 0);
  return Math.round((sum / arr.length) * 10) / 10;
};

// ─── Validation helpers per game type ─────────────────────────────────

const validateSeguin = (body) => {
  const { completionTime, accuracy, seguinErrors = 0, seguinMisplacements = 0, level = 1 } = body;
  if (completionTime === undefined) throw new Error('completionTime is required for seguin');
  return {
    completionTime: Number(completionTime),
    accuracy: accuracy !== undefined ? Number(accuracy) : 100,
    level: Number(level),
    seguinErrors: Number(seguinErrors),
    seguinMisplacements: Number(seguinMisplacements),
  };
};

const validateMonkey = (body) => {
  const { completionTime, accuracy, wpm, errors = 0, charactersTyped, level = 1 } = body;
  if (completionTime === undefined) throw new Error('completionTime is required for monkey');
  if (wpm === undefined) throw new Error('wpm is required for monkey');
  return {
    completionTime: Number(completionTime),
    accuracy: accuracy !== undefined ? Number(accuracy) : 100,
    wpm: Number(wpm),
    errors: Number(errors),
    charactersTyped: charactersTyped ? Number(charactersTyped) : undefined,
    level: Number(level),
  };
};

const validateJigsaw = (body) => {
  const { completionTime, accuracy, ageGroup, puzzleSize, totalPieces, hintsUsed = 0, imageName, level = 1 } = body;
  if (completionTime === undefined) throw new Error('completionTime is required for jigsaw');
  if (!ageGroup) throw new Error('ageGroup is required for jigsaw');
  if (!totalPieces) throw new Error('totalPieces is required for jigsaw');
  return {
    completionTime: Number(completionTime),
    accuracy: accuracy !== undefined ? Number(accuracy) : 100,
    ageGroup,
    puzzleSize,
    totalPieces: Number(totalPieces),
    hintsUsed: Number(hintsUsed),
    imageName,
    level: Number(level),
  };
};

const validateBalloon = (body) => {
  const {
    completionTime, ageGroup,
    balloonsPopped, balloonsMissed, maxCombo, finalScore,
    difficultyReached = 1, sessionAccuracy,
  } = body;

  if (completionTime === undefined) throw new Error('completionTime is required for balloon');
  if (!ageGroup)            throw new Error('ageGroup is required for balloon');
  if (balloonsPopped === undefined) throw new Error('balloonsPopped is required for balloon');
  if (balloonsMissed === undefined) throw new Error('balloonsMissed is required for balloon');
  if (maxCombo      === undefined)  throw new Error('maxCombo is required for balloon');
  if (finalScore    === undefined)  throw new Error('finalScore is required for balloon');

  const popped = Number(balloonsPopped);
  const missed = Number(balloonsMissed);
  const computedAccuracy = popped + missed > 0
    ? Math.round((popped / (popped + missed)) * 1000) / 10
    : 100;

  return {
    completionTime:    Number(completionTime),
    ageGroup,
    balloonsPopped:    popped,
    balloonsMissed:    missed,
    maxCombo:          Number(maxCombo),
    finalScore:        Number(finalScore),
    difficultyReached: Number(difficultyReached),
    sessionAccuracy:   sessionAccuracy !== undefined ? Number(sessionAccuracy) : computedAccuracy,
    accuracy:          sessionAccuracy !== undefined ? Number(sessionAccuracy) : computedAccuracy,
  };
};

// Map of validators per game type (Open/Closed principle)
const gameValidators = {
  seguin:  validateSeguin,
  monkey:  validateMonkey,
  jigsaw:  validateJigsaw,
  balloon: validateBalloon,
};

// ─── Save Game Progress ───────────────────────────────────────────────
// @route   POST /api/progress
// @access  Private
export const saveGameProgress = async (req, res) => {
  try {
    const { gameType } = req.body;

    if (!VALID_GAME_TYPES.includes(gameType)) {
      return res.status(400).json({ success: false, message: `Invalid gameType. Must be one of: ${VALID_GAME_TYPES.join(', ')}` });
    }

    const validator = gameValidators[gameType];
    const gameData = validator(req.body);

    const progress = await GameProgress.create({
      userId: req.user.id,
      gameType,
      date: new Date(),
      ...gameData,
    });

    logger.info(`Progress saved: userId=${req.user.id} game=${gameType} id=${progress._id}`);

    res.status(201).json({ success: true, data: progress });
  } catch (error) {
    logger.error(`Save progress error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── Get Progress Dashboard Data ──────────────────────────────────────
// @route   GET /api/progress?game=all&timeFrame=month
// @access  Private
export const getProgressData = asyncHandler(async (req, res) => {
  const { game = 'all', timeFrame = 'month' } = req.query;
  const { startDate, endDate } = getDateRange(timeFrame);

  const baseQuery = { userId: req.user.id };
  const rangeQuery = { ...baseQuery, date: { $gte: startDate, $lte: endDate } };
  if (game !== 'all') rangeQuery.gameType = game;

  const [progressData, allGames] = await Promise.all([
    GameProgress.find(rangeQuery).sort({ date: 1 }),
    GameProgress.find(baseQuery),
  ]);

  const totalSessions = allGames.length;

  // ── Game distribution ─────────────────────────────────────────────
  const gameDistribution = { seguin: 0, monkey: 0, jigsaw: 0, balloon: 0 };
  if (totalSessions > 0) {
    VALID_GAME_TYPES.forEach((type) => {
      const count = allGames.filter((g) => g.gameType === type).length;
      gameDistribution[type] = Math.round((count / totalSessions) * 100);
    });
  }

  // ── Time-series: one entry per date, all game values ─────────────
  const timeSeriesMap = new Map();
  progressData.forEach((entry) => {
    const dateKey = entry.date.toISOString().split('T')[0];
    if (!timeSeriesMap.has(dateKey)) {
      timeSeriesMap.set(dateKey, {
        date:            dateKey,
        seguin:          null,
        monkey:          null,
        monkeyAccuracy:  null,
        jigsaw:          null,
        jigsawPieces:    null,
        balloon:         null,
        balloonAccuracy: null,
      });
    }
    const day = timeSeriesMap.get(dateKey);
    switch (entry.gameType) {
      case 'seguin':
        day.seguin = entry.completionTime;
        break;
      case 'monkey':
        day.monkey         = entry.wpm || entry.completionTime;
        day.monkeyAccuracy = entry.accuracy;
        break;
      case 'jigsaw':
        day.jigsaw      = entry.completionTime;
        day.jigsawPieces = entry.totalPieces;
        break;
      case 'balloon':
        day.balloon         = entry.finalScore;
        day.balloonAccuracy = entry.sessionAccuracy || entry.accuracy;
        break;
    }
  });

  // ── Per-game detailed metrics ──────────────────────────────────────
  const byGame = {};
  VALID_GAME_TYPES.forEach((type) => {
    byGame[type] = progressData.filter((e) => e.gameType === type);
  });

  // Average completion times
  const averageCompletionTimes = {};
  const averageWpm = {};
  const averageScore = {};
  const averageAccuracy = {};

  if (byGame.seguin.length > 0) {
    averageCompletionTimes.seguin = safeAvg(byGame.seguin, 'completionTime');
    averageAccuracy.seguin        = safeAvg(byGame.seguin, 'accuracy');
  }
  if (byGame.monkey.length > 0) {
    averageCompletionTimes.monkey = safeAvg(byGame.monkey, 'completionTime');
    averageWpm.monkey             = safeAvg(byGame.monkey, 'wpm');
    averageAccuracy.monkey        = safeAvg(byGame.monkey, 'accuracy');
  }
  if (byGame.jigsaw.length > 0) {
    averageCompletionTimes.jigsaw = safeAvg(byGame.jigsaw, 'completionTime');
    averageAccuracy.jigsaw        = safeAvg(byGame.jigsaw, 'accuracy');
  }
  if (byGame.balloon.length > 0) {
    averageCompletionTimes.balloon = safeAvg(byGame.balloon, 'completionTime');
    averageScore.balloon           = safeAvg(byGame.balloon, 'finalScore');
    averageAccuracy.balloon        = safeAvg(byGame.balloon, 'sessionAccuracy');
  }

  // Improvement metrics
  const improvementMetrics = {};
  if (byGame.seguin.length >= 3)  improvementMetrics.seguin  = calcImprovement(byGame.seguin,  'completionTime');
  if (byGame.monkey.length >= 3)  improvementMetrics.monkey  = calcImprovement(byGame.monkey,  'wpm') !== null
    ? -calcImprovement(byGame.monkey, 'wpm') : null; // higher wpm = improvement
  if (byGame.jigsaw.length >= 3)  improvementMetrics.jigsaw  = calcImprovement(byGame.jigsaw,  'completionTime');
  if (byGame.balloon.length >= 3) improvementMetrics.balloon = calcImprovement(byGame.balloon, 'finalScore') !== null
    ? -calcImprovement(byGame.balloon, 'finalScore') : null; // higher score = improvement

  // Cognitive skills computed from real data
  const cognitiveSkills = totalSessions > 0
    ? calculateCognitiveSkills(progressData)
    : [];

  // Recent sessions (last 20, newest first)
  const recentSessions = [...progressData]
    .sort((a, b) => b.date - a.date)
    .slice(0, 20)
    .map((s) => ({
      gameType:       s.gameType,
      date:           s.date,
      completionTime: s.completionTime,
      accuracy:       s.accuracy,
      wpm:            s.wpm,
      finalScore:     s.finalScore,
      sessionAccuracy: s.sessionAccuracy,
    }));

  res.status(200).json({
    timeSeriesData:       Array.from(timeSeriesMap.values()),
    gameDistribution,
    averageCompletionTimes,
    averageWpm,
    averageScore,
    averageAccuracy,
    improvementMetrics,
    totalSessions,
    benchmarks:           GAME_BENCHMARKS,
    cognitiveSkills,
    recentSessions,
  });
});

// ─── Per-game Detailed Statistics ────────────────────────────────────
// @route   GET /api/progress/stats/:gameType
// @access  Private
export const getGameStatistics = asyncHandler(async (req, res) => {
  const { gameType } = req.params;

  if (!VALID_GAME_TYPES.includes(gameType)) {
    return res.status(400).json({ success: false, message: 'Invalid game type' });
  }

  const sessions = await GameProgress.find({
    userId: req.user.id,
    gameType,
  }).sort({ date: 1 });

  if (sessions.length === 0) {
    return res.status(200).json({
      message: 'No sessions found for this game',
      data: { bestTime: null, averageTime: null, totalSessions: 0, sessions: [] },
    });
  }

  const times     = sessions.map((s) => s.completionTime);
  const bestTime  = Math.min(...times);
  const avgTime   = safeAvg(sessions, 'completionTime');

  const response = {
    totalSessions: sessions.length,
    bestTime,
    averageTime: avgTime,
    sessions: sessions.slice(-20), // last 20 sessions for chart
  };

  if (gameType === 'monkey') {
    response.bestWpm    = Math.max(...sessions.map((s) => s.wpm || 0));
    response.averageWpm = safeAvg(sessions, 'wpm');
    response.avgAccuracy = safeAvg(sessions, 'accuracy');
  }
  if (gameType === 'balloon') {
    response.bestScore    = Math.max(...sessions.map((s) => s.finalScore || 0));
    response.averageScore = safeAvg(sessions, 'finalScore');
    response.avgAccuracy  = safeAvg(sessions, 'sessionAccuracy');
    response.bestCombo    = Math.max(...sessions.map((s) => s.maxCombo || 0));
  }

  res.status(200).json(response);
});

// ─── Admin: All Children's Progress ───────────────────────────────────
// @route   GET /api/progress/admin/all
// @access  Private + Admin
export const getAdminProgressOverview = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  // Get all non-admin users
  const children = await User.find({ isAdmin: false }).select('name username age birthDate createdAt');

  // Get progress for each child
  const childrenProgress = await Promise.all(
    children.map(async (child) => {
      const sessions = await GameProgress.find({ userId: child._id })
        .sort({ date: -1 });

      const totalSessions = sessions.length;
      const gameBreakdown = {};

      VALID_GAME_TYPES.forEach((type) => {
        const gameSessions = sessions.filter((s) => s.gameType === type);
        if (gameSessions.length === 0) return;

        gameBreakdown[type] = {
          totalSessions: gameSessions.length,
          lastPlayed:    gameSessions[0]?.date,
        };

        if (type === 'monkey') {
          gameBreakdown[type].avgWpm      = safeAvg(gameSessions, 'wpm');
          gameBreakdown[type].avgAccuracy = safeAvg(gameSessions, 'accuracy');
          gameBreakdown[type].bestWpm     = Math.max(...gameSessions.map((s) => s.wpm || 0));
        } else if (type === 'balloon') {
          gameBreakdown[type].avgScore    = safeAvg(gameSessions, 'finalScore');
          gameBreakdown[type].avgAccuracy = safeAvg(gameSessions, 'sessionAccuracy');
          gameBreakdown[type].bestScore   = Math.max(...gameSessions.map((s) => s.finalScore || 0));
        } else {
          gameBreakdown[type].avgTime     = safeAvg(gameSessions, 'completionTime');
          gameBreakdown[type].bestTime    = gameSessions.length
            ? Math.min(...gameSessions.map((s) => s.completionTime))
            : null;
          gameBreakdown[type].avgAccuracy = safeAvg(gameSessions, 'accuracy');
        }
      });

      // Last 7 days activity
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentActivity = sessions.filter((s) => s.date >= sevenDaysAgo).length;

      return {
        child: {
          id:        child._id,
          name:      child.name || child.username,
          username:  child.username,
          age:       child.age,
          joinedAt:  child.createdAt,
        },
        totalSessions,
        recentActivity,
        lastActive: sessions[0]?.date || null,
        gameBreakdown,
      };
    })
  );

  // Platform-wide stats
  const allSessions = await GameProgress.find({});
  const platformStats = {
    totalChildren:  children.length,
    totalSessions:  allSessions.length,
    gameBreakdown:  {},
  };
  VALID_GAME_TYPES.forEach((type) => {
    platformStats.gameBreakdown[type] = allSessions.filter((s) => s.gameType === type).length;
  });

  res.status(200).json({
    success: true,
    platformStats,
    children: childrenProgress,
  });
});

// ─── Admin: Single Child's Full History ───────────────────────────────
// @route   GET /api/progress/admin/child/:childId
// @access  Private + Admin
export const getChildProgressDetail = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  const { childId } = req.params;
  const { timeFrame = 'month', game = 'all' } = req.query;
  const { startDate, endDate } = getDateRange(timeFrame);

  const child = await User.findById(childId).select('-password -tokens');
  if (!child || child.isAdmin) {
    return res.status(404).json({ success: false, message: 'Child not found' });
  }

  const query = {
    userId: childId,
    date:   { $gte: startDate, $lte: endDate },
  };
  if (game !== 'all') query.gameType = game;

  const sessions = await GameProgress.find(query).sort({ date: 1 });

  // Reuse child-facing progress format
  res.status(200).json({
    success: true,
    child: {
      id:       child._id,
      name:     child.name || child.username,
      username: child.username,
      age:      child.age,
    },
    totalSessions: sessions.length,
    sessions,
  });
});

// ─── Cognitive skills helper ──────────────────────────────────────────
const calculateCognitiveSkills = (progressData) => {
  const skills = [];
  if (progressData.length === 0) return skills;

  // Pattern Recognition – Seguin (lower time = higher score)
  const seguinGames = progressData.filter((g) => g.gameType === 'seguin');
  if (seguinGames.length > 0) {
    const avg = seguinGames.reduce((s, g) => s + g.completionTime, 0) / seguinGames.length;
    skills.push({
      name: 'Pattern Recognition',
      value: Math.round(Math.max(0, Math.min(100, 100 - (avg / 120) * 100 + 50))),
    });
  }

  // Visual Processing – Jigsaw
  const jigsawGames = progressData.filter((g) => g.gameType === 'jigsaw');
  if (jigsawGames.length > 0) {
    const avg = jigsawGames.reduce((s, g) => s + g.completionTime, 0) / jigsawGames.length;
    skills.push({
      name: 'Visual Processing',
      value: Math.round(Math.max(0, Math.min(100, 100 - (avg / 400) * 100 + 40))),
    });
  }

  // Typing Speed – Monkey Type
  const monkeyGames = progressData.filter((g) => g.gameType === 'monkey');
  if (monkeyGames.length > 0) {
    const avgWpm = monkeyGames.reduce((s, g) => s + (g.wpm || 0), 0) / monkeyGames.length;
    skills.push({
      name: 'Processing Speed',
      value: Math.round(Math.max(0, Math.min(100, (avgWpm / 60) * 100))),
    });
  }

  // Hand-Eye Coordination – Balloon
  const balloonGames = progressData.filter((g) => g.gameType === 'balloon');
  if (balloonGames.length > 0) {
    const avgAcc = balloonGames.reduce((s, g) => s + (g.sessionAccuracy || 0), 0) / balloonGames.length;
    skills.push({
      name: 'Hand-Eye Coordination',
      value: Math.round(Math.max(0, Math.min(100, avgAcc))),
    });
  }

  // Focus – based on consistency (low variance across all games)
  if (progressData.length >= 3) {
    const times   = progressData.map((g) => g.completionTime);
    const avgTime = times.reduce((s, t) => s + t, 0) / times.length;
    const variance = times.reduce((s, t) => s + Math.pow(t - avgTime, 2), 0) / times.length;
    skills.push({
      name: 'Focus',
      value: Math.round(Math.max(0, Math.min(100, 100 - (variance / 1000) * 100))),
    });
  }

  return skills;
};
