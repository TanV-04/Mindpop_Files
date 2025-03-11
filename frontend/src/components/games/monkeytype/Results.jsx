import React from "react";
import { motion } from "framer-motion";
import { formatPercentage, calculateWPM } from "../../../utils/helpers";

const ResultCard = ({ label, value, color = "text-indigo-400", icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-slate-800 rounded-lg p-4 flex items-center w-full"
    >
      {icon && <div className="mr-3 text-2xl">{icon}</div>}
      <div className="flex-1">
        <div className="text-slate-400 text-sm">{label}</div>
        <div className={`text-xl font-bold ${color}`}>{value}</div>
      </div>
    </motion.div>
  );
};

const Results = ({ 
  state, 
  errors = 0, 
  accuracyPercentage = 0, 
  total = 0, 
  timeLeft = 0, 
  className = "",
  totalTypingTime = 60 // Default total time in seconds, adjust as needed
}) => {
  if (state !== "finish") {
    return null;
  }
  
  // Calculate actual time used for typing (totalTypingTime - timeLeft)
  const timeUsed = totalTypingTime - timeLeft;
  
  // Calculate WPM based on characters typed and time used
  const wpm = calculateWPM ? calculateWPM(total, timeUsed) : Math.round((total / 5) / (timeUsed / 60));
  
  // Ensure values are safe
  const safeWPM = Math.max(0, isNaN(wpm) ? 0 : wpm);
  const safeAccuracy = Math.max(0, accuracyPercentage || 0);
  const safeErrors = Math.max(0, errors || 0);
  const safeTotal = Math.max(0, total || 0);

  // Trophy animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

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
    if (safeWPM >= 40) return "🏃";
    return "🐢";
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`w-full ${className}`}
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-center mb-6 text-white"
      >
        Your Results
      </motion.h2>

      <div className="space-y-4">
        <ResultCard 
          label="Words Per Minute" 
          value={safeWPM} 
          color="text-green-400"
          icon={getSpeedEmoji()}
          delay={0.3}
        />
        
        <ResultCard 
          label="Accuracy" 
          value={formatPercentage(safeAccuracy)} 
          color={safeAccuracy >= 90 ? "text-green-400" : 
                safeAccuracy >= 70 ? "text-yellow-400" : "text-red-400"}
          icon={getAccuracyEmoji()}
          delay={0.5}
        />
        
        <ResultCard 
          label="Characters Typed" 
          value={safeTotal} 
          color="text-blue-400"
          icon="⌨️"
          delay={0.7}
        />
        
        <ResultCard 
          label="Errors" 
          value={safeErrors} 
          color={safeErrors === 0 ? "text-green-400" : 
                safeErrors < 5 ? "text-yellow-400" : "text-red-500"}
          icon="❌"
          delay={0.9}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-8 text-center text-slate-400 text-sm"
      >
        {safeAccuracy >= 95 && safeWPM >= 50 ? (
          "Incredible! You're both fast and accurate!"
        ) : safeWPM >= 60 ? (
          "Impressive speed! You're a typing master!"
        ) : safeWPM >= 40 ? (
          "Good job! Keep practicing to improve your speed."
        ) : safeAccuracy >= 95 ? (
          "Great accuracy! Now try to increase your speed."
        ) : (
          "Nice start! Regular practice will boost your typing skills."
        )}
      </motion.div>
    </motion.div>
  );
};

export default Results;