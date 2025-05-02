import GameProgress from '../models/GameProgress.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { logger } from '../utils/logger.js';

// Helper function to get date range based on time frame
const getDateRange = (timeFrame) => {
  const endDate = new Date();
  let startDate = new Date();
  
  switch (timeFrame) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 1); // Default to month
  }
  
  return { startDate, endDate };
};

// @desc    Get user's progress data
// @route   GET /api/progress?game=all&timeFrame=month
// @access  Private
export const getProgressData = asyncHandler(async (req, res) => {
  const { game = 'all', timeFrame = 'month' } = req.query;
  const { startDate, endDate } = getDateRange(timeFrame);
  
  // Build query
  const query = {
    userId: req.user.id,
    date: { $gte: startDate, $lte: endDate }
  };
  
  // Add game filter if specific game is requested
  if (game !== 'all') {
    query.gameType = game;
  }
  
  // Get progress data
  const progressData = await GameProgress.find(query).sort({ date: 1 });
  
  // Process data for frontend visualization
  const processedData = {
    timeSeriesData: [],
    gameDistribution: {},
    averageCompletionTimes: {},
    improvementMetrics: {}
  };
  
  // Calculate game distribution
  const allGames = await GameProgress.find({ userId: req.user.id });
  const gameCount = allGames.length;
  
  if (gameCount > 0) {
    const gameTypes = ['seguin', 'monkey', 'jigsaw'];
    gameTypes.forEach(type => {
      const count = allGames.filter(game => game.gameType === type).length;
      processedData.gameDistribution[type] = Math.round((count / gameCount) * 100);
    });
  }
  
  // Process time series data
  const timeSeriesMap = new Map();
  
  progressData.forEach(entry => {
    const dateKey = entry.date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!timeSeriesMap.has(dateKey)) {
      timeSeriesMap.set(dateKey, {
        date: dateKey,
        seguin: null,
        monkey: null,
        jigsaw: null
      });
    }
    
    const dayData = timeSeriesMap.get(dateKey);
    dayData[entry.gameType] = entry.completionTime;
  });
  
  processedData.timeSeriesData = Array.from(timeSeriesMap.values());
  
  // Calculate average completion times
  const seguinData = progressData.filter(entry => entry.gameType === 'seguin');
  const monkeyData = progressData.filter(entry => entry.gameType === 'monkey');
  const jigsawData = progressData.filter(entry => entry.gameType === 'jigsaw');
  
  if (seguinData.length > 0) {
    const avgTime = seguinData.reduce((sum, entry) => sum + entry.completionTime, 0) / seguinData.length;
    processedData.averageCompletionTimes.seguin = Math.round(avgTime * 10) / 10; // Round to 1 decimal
  }
  
  if (monkeyData.length > 0) {
    const avgTime = monkeyData.reduce((sum, entry) => sum + entry.completionTime, 0) / monkeyData.length;
    processedData.averageCompletionTimes.monkey = Math.round(avgTime * 10) / 10; // Round to 1 decimal
  }
  
  if (jigsawData.length > 0) {
    const avgTime = jigsawData.reduce((sum, entry) => sum + entry.completionTime, 0) / jigsawData.length;
    processedData.averageCompletionTimes.jigsaw = Math.round(avgTime * 10) / 10; // Round to 1 decimal
  }
  
  // Calculate improvement metrics (if enough data points)
  if (seguinData.length >= 3) {
    const sortedData = [...seguinData].sort((a, b) => a.date - b.date);
    const firstThree = sortedData.slice(0, 3);
    const lastThree = sortedData.slice(-3);
    
    const avgFirst = firstThree.reduce((sum, entry) => sum + entry.completionTime, 0) / 3;
    const avgLast = lastThree.reduce((sum, entry) => sum + entry.completionTime, 0) / 3;
    
    // Calculate improvement percentage (lower time is better)
    if (avgFirst > 0) {
      const improvement = ((avgFirst - avgLast) / avgFirst) * 100;
      processedData.improvementMetrics.seguin = Math.round(improvement);
    }
  }
  
  if (monkeyData.length >= 3) {
    const sortedData = [...monkeyData].sort((a, b) => a.date - b.date);
    const firstThree = sortedData.slice(0, 3);
    const lastThree = sortedData.slice(-3);
    
    const avgFirst = firstThree.reduce((sum, entry) => sum + entry.completionTime, 0) / 3;
    const avgLast = lastThree.reduce((sum, entry) => sum + entry.completionTime, 0) / 3;
    
    // Calculate improvement percentage (lower time is better)
    if (avgFirst > 0) {
      const improvement = ((avgFirst - avgLast) / avgFirst) * 100;
      processedData.improvementMetrics.monkey = Math.round(improvement);
    }
  }
  
  if (jigsawData.length >= 3) {
    const sortedData = [...jigsawData].sort((a, b) => a.date - b.date);
    const firstThree = sortedData.slice(0, 3);
    const lastThree = sortedData.slice(-3);
    
    const avgFirst = firstThree.reduce((sum, entry) => sum + entry.completionTime, 0) / 3;
    const avgLast = lastThree.reduce((sum, entry) => sum + entry.completionTime, 0) / 3;
    
    // Calculate improvement percentage (lower time is better)
    if (avgFirst > 0) {
      const improvement = ((avgFirst - avgLast) / avgFirst) * 100;
      processedData.improvementMetrics.jigsaw = Math.round(improvement);
    }
  }
  
  // Calculate total sessions count
  processedData.totalSessions = gameCount;
  
  // Add standardized benchmark data for comparison
  processedData.benchmarks = {
    seguin: {
      standardTime: 80 // seconds (example standard time)
    },
    monkey: {
      standardTime: 120 // seconds (example standard time)
    },
    jigsaw: {
      standardTime: 300 // seconds (example standard time for jigsaw)
    }
  };
  
  // Add cognitive skills assessment (placeholder for now)
  processedData.cognitiveSkills = [
    { name: 'Pattern Recognition', value: 85 },
    { name: 'Hand-Eye Coordination', value: 70 },
    { name: 'Visual Processing', value: 75 },
    { name: 'Spatial Awareness', value: 80 },
    { name: 'Focus', value: 65 }
  ];
  
  res.status(200).json(processedData);
});

// @desc    Save new game progress data
// @route   POST /api/progress
// @access  Private
export const saveGameProgress = asyncHandler(async (req, res) => {
  try {
    console.log('Received progress data:', req.body);
    console.log('User info:', req.user);

    const { 
      gameType, 
      completionTime, 
      level, 
      accuracy, 
      ageGroup, 
      puzzleSize, 
      totalPieces 
    } = req.body;
    
    if (!gameType || completionTime === undefined) {
      console.error('Missing required fields:', { gameType, completionTime });
      res.status(400);
      throw new Error('Please provide all required fields');
    }
    
    // Validate game type
    if (!['seguin', 'monkey', 'jigsaw'].includes(gameType)) {
      console.error('Invalid game type:', gameType);
      res.status(400);
      throw new Error('Invalid game type');
    }
    
    // Create base progress object
    const progressData = {
      userId: req.user.id,
      gameType,
      completionTime,
      level: level || 1,
      accuracy: accuracy || 100,
      date: new Date()
    };
    
    // Add jigsaw-specific fields if game type is jigsaw
    if (gameType === 'jigsaw') {
      progressData.ageGroup = ageGroup;
      progressData.puzzleSize = puzzleSize;
      progressData.totalPieces = totalPieces;
    }
    
    const newProgress = await GameProgress.create(progressData);
    
    res.status(201).json(newProgress);
  } catch (error) {
    console.error('Error in saveGameProgress:', error);
    throw error;
  }
});

// @desc    Get statistics for specific game
// @route   GET /api/progress/stats/:gameType
// @access  Private
export const getGameStatistics = asyncHandler(async (req, res) => {
  const { gameType } = req.params;
  
  // Validate game type
  if (!['seguin', 'monkey', 'jigsaw'].includes(gameType)) {
    res.status(400);
    throw new Error('Invalid game type');
  }
  
  // Get all progress data for this game type
  const progressData = await GameProgress.find({
    userId: req.user.id,
    gameType
  }).sort({ date: 1 });
  
  if (progressData.length === 0) {
    return res.status(200).json({
      message: 'No progress data found for this game',
      data: {
        bestTime: null,
        averageTime: null,
        totalSessions: 0,
        weeklyProgress: []
      }
    });
  }
  
  // Calculate stats
  const bestTime = Math.min(...progressData.map(p => p.completionTime));
  const averageTime = progressData.reduce((sum, p) => sum + p.completionTime, 0) / progressData.length;
  
  // Get percentile ranking (placeholder - would need population data in real implementation)
  const percentile = 75; // Example hardcoded value
  
  // Weekly progress (last 10 sessions)
  const recentSessions = progressData.slice(-10);
  
  res.status(200).json({
    bestTime,
    averageTime: Math.round(averageTime * 10) / 10,
    totalSessions: progressData.length,
    percentile,
    recentSessions
  });
});
