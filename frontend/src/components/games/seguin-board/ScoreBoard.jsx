import  { useState } from 'react';
import ResultsAnalysis from './ResultsAnalysis';

const ScoreBoard = ({ time, age, onPlayAgain }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = (timeInSeconds % 60).toFixed(1);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Calculate performance message based on time
  const getPerformanceMessage = (timeInSeconds) => {
    // For children-friendly feedback
    if (timeInSeconds < 30) {
      return "Excellent job! Very fast!";
    } else if (timeInSeconds < 60) {
      return "Great work! You did well!";
    } else if (timeInSeconds < 90) {
      return "Good job! You completed the task!";
    } else {
      return "Well done on finishing! Practice makes perfect!";
    }
  };

  return (
    <div className="score-board bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold text-[#66220B] mb-4">Great Job!</h2>
      
      <div className="time-display text-4xl font-bold text-[#F09000] mb-6">
        {formatTime(time)}
      </div>
      
      <p className="text-lg text-gray-700 mb-6">
        {getPerformanceMessage(time)}
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
        <button 
          className="play-again-button bg-[#F09000] hover:bg-[#D87D00] text-white font-bold py-3 px-6 rounded-full text-lg transition-colors"
          onClick={onPlayAgain}
        >
          Play Again
        </button>
        
        <button 
          className="analysis-button bg-white hover:bg-gray-100 text-[#66220B] font-bold py-3 px-6 border-2 border-[#66220B] rounded-full text-lg transition-colors"
          onClick={() => setShowAnalysis(!showAnalysis)}
        >
          {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
        </button>
      </div>
      
      <ResultsAnalysis
        time={time}
        age={age}
        isVisible={showAnalysis}
      />
    </div>
  );
};

export default ScoreBoard;