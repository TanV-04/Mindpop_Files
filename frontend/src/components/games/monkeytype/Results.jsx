import React from "react";
import { motion } from "framer-motion";
import { formatPercentage, calculateWPM } from "../../../utils/helpers";

// Enhanced visual design for result cards
const ResultCard = ({ label, value, color = "text-indigo-400", icon, delay, bgColor = "bg-gray-800" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${bgColor} rounded-xl p-5 flex items-center w-full shadow-lg`}
      style={{ 
        boxShadow: `0 4px 6px rgba(0,0,0,0.1), 0 0 1px 1px rgba(${color === 'text-green-400' ? '52,199,89' : color === 'text-red-500' ? '255,59,48' : '0,122,255'},0.1)` 
      }}
    >
      {icon && (
        <div className="mr-4 text-3xl flex items-center justify-center w-12 h-12 rounded-full bg-opacity-20"
          style={{ backgroundColor: `rgba(${color === 'text-green-400' ? '52,199,89' : color === 'text-red-500' ? '255,59,48' : '0,122,255'},0.15)` }}
        >
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className="text-sm text-gray-400 mb-1">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </div>
    </motion.div>
  );
};

// Enhanced badge for the progress saved indicator
const ProgressBadge = ({ delay = 1.1 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-green-800 rounded-xl p-5 flex items-center w-full shadow-lg"
    style={{ boxShadow: '0 4px 10px rgba(52,199,89,0.2)' }}
  >
    <div className="mr-4 text-3xl flex items-center justify-center w-12 h-12 rounded-full bg-green-700">
      ✅
    </div>
    <div className="flex-1">
      <div className="text-green-400 text-lg font-medium">Progress Saved</div>
      <div className="text-green-200 text-sm">Your results have been saved to your profile</div>
    </div>
  </motion.div>
);

// Trophy animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

// Feedback message based on performance
const getFeedbackMessage = (wpm, accuracy) => {
  if (accuracy >= 95 && wpm >= 50) {
    return {
      message: "Incredible! You're both fast and accurate!",
      emoji: "🔥",
      color: "text-yellow-400"
    };
  } else if (wpm >= 60) {
    return {
      message: "Impressive speed! You're a typing master!",
      emoji: "⚡️",
      color: "text-blue-400"
    };
  } else if (wpm >= 40) {
    return {
      message: "Good job! Keep practicing to improve your speed.",
      emoji: "👍",
      color: "text-indigo-400"
    };
  } else if (accuracy >= 95) {
    return {
      message: "Great accuracy! Now try to increase your speed.",
      emoji: "🎯",
      color: "text-green-400"
    };
  } else {
    return {
      message: "Nice start! Regular practice will boost your typing skills.",
      emoji: "🚀",
      color: "text-purple-400"
    };
  }
};

const Results = ({ 
  state, 
  errors = 0, 
  accuracyPercentage = 0, 
  total = 0, 
  timeLeft = 0, 
  className = "",
  totalTypingTime = 60, 
  savedProgress = false 
}) => {
  if (state !== "finish") {
    return null;
  }
  
  // Calculate actual time used for typing
  const timeUsed = Math.max(1, totalTypingTime - timeLeft);
  
  // Calculate WPM and ensure values are safe
  const wpm = calculateWPM(total, timeUsed);
  const safeWPM = Math.max(0, wpm);
  
  // Calculate accuracy correctly
  const correctChars = Math.max(0, total - errors);
  const safeAccuracy = total > 0 ? (correctChars / total) * 100 : 0;
  
  const safeErrors = Math.max(0, errors);
  const safeTotal = Math.max(0, total);

  const getAccuracyEmoji = () => {
    if (safeAccuracy >= 98) return "🏆";
    if (safeAccuracy >= 90) return "🥇";
    if (safeAccuracy >= 80) return "🥈";
    if (safeAccuracy >= 70) return "🥉";
    return "🎯";
  };

  const getSpeedEmoji = () => {
    if (safeWPM >= 80) return "⚡";
    if (safeWPM >= 60) return "🚀";
    if (safeWPM >= 40) return "💨";
    return "🐢";
  };

  const feedback = getFeedbackMessage(safeWPM, safeAccuracy);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`w-full ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-6 px-8 rounded-xl mb-8 text-center shadow-lg"
      >
        <div className="text-4xl mb-3">{feedback.emoji}</div>
        <h2 className="text-3xl font-bold mb-2">Your Results</h2>
        <p className={`${feedback.color} text-lg`}>{feedback.message}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ResultCard 
          label="Words Per Minute" 
          value={safeWPM} 
          color="text-blue-400"
          icon={getSpeedEmoji()}
          delay={0.3}
          bgColor="bg-gray-900"
        />
        
        <ResultCard 
          label="Accuracy" 
          value={formatPercentage(safeAccuracy)} 
          color={safeAccuracy >= 90 ? "text-green-400" : 
                safeAccuracy >= 70 ? "text-yellow-400" : "text-red-500"}
          icon={getAccuracyEmoji()}
          delay={0.5}
          bgColor="bg-gray-900"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ResultCard 
          label="Characters Typed" 
          value={safeTotal} 
          color="text-purple-400"
          icon="⌨️"
          delay={0.7}
          bgColor="bg-gray-800"
        />
        
        <ResultCard 
          label="Errors" 
          value={safeErrors} 
          color={safeErrors === 0 ? "text-green-400" : 
                safeErrors < 5 ? "text-yellow-400" : "text-red-500"}
          icon="❌"
          delay={0.9}
          bgColor="bg-gray-800"
        />
      </div>

      {/* Progress saved indicator */}
      {savedProgress && <ProgressBadge delay={1.1} />}

      {/* Additional statistics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        className="mt-8 grid grid-cols-3 gap-4"
      >
        <div className="text-center bg-gray-800 p-4 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
          <div className="text-xl font-semibold text-gray-200">{timeUsed}s</div>
        </div>
        
        <div className="text-center bg-gray-800 p-4 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide">CPM</div>
          <div className="text-xl font-semibold text-gray-200">{safeWPM * 5}</div>
        </div>
        
        <div className="text-center bg-gray-800 p-4 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Correct</div>
          <div className="text-xl font-semibold text-gray-200">{correctChars}</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Results;