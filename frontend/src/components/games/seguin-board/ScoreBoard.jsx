import { useState, useEffect } from "react";
import ResultsAnalysis from "./ResultAnalysis";
import { Trophy, Clock, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { progressService } from "../../../utils/apiService"; // Import the progress service

const ScoreBoard = ({ time, age, onPlayAgain }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [savedToDatabase, setSavedToDatabase] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Function to save progress to database
  const saveProgress = async () => {
    if (savedToDatabase) return; // Prevent multiple saves

    try {
      // Determine age group
      let ageGroup = "9-12"; // Default age group

      if (age <= 8) {
        ageGroup = "6-8";
      } else if (age >= 13) {
        ageGroup = "12-14";
      } else {
        ageGroup = "9-12";
      }

      // Prepare progress data
      const progressData = {
        gameType: "seguin", // This is the Seguin Form Board game
        completionTime: Number(time), // Ensure time is a number
        accuracy: 100, // Default accuracy (can be calculated if available)
        level: age < 7 ? 1 : age > 10 ? 3 : 2, // Level based on age
        date: new Date().toISOString(),
        ageGroup,
      };

      console.log("Saving progress data:", progressData);
      const response = await progressService.saveGameProgress(progressData);
      console.log("Progress saved successfully:", response);

      setSavedToDatabase(true);
    } catch (error) {
      console.error("Error saving progress:", error);
      setSaveError(
        "Failed to save progress. Your score was recorded locally only."
      );
    }
  };

  // Save progress when component mounts or time changes
  useEffect(() => {
    if (time > 0) {
      saveProgress();
    }
  }, [time]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = (timeInSeconds % 60).toFixed(1);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Calculate performance message based on time
  const getPerformanceMessage = (timeInSeconds) => {
    const benchmarks = {
      5: { excellent: 60, good: 90, average: 120 },
      6: { excellent: 50, good: 80, average: 110 },
      7: { excellent: 45, good: 70, average: 100 },
      8: { excellent: 40, good: 65, average: 90 },
      9: { excellent: 35, good: 60, average: 85 },
      10: { excellent: 30, good: 55, average: 80 },
      11: { excellent: 25, good: 50, average: 75 },
      12: { excellent: 20, good: 45, average: 70 },
    };

    const benchmark = benchmarks[age] || benchmarks[10];

    if (timeInSeconds <= benchmark.excellent) {
      return { message: "Excellent job! Very fast completion!", emoji: "🌟" };
    } else if (timeInSeconds <= benchmark.good) {
      return { message: "Great work! You did well!", emoji: "🎉" };
    } else if (timeInSeconds < 90) {
      return { message: "Good job! You completed the task!", emoji: "👍" };
    } else {
      return {
        message: "Well done on finishing! Practice makes perfect!",
        emoji: "😊",
      };
    }
  };

  const performance = getPerformanceMessage(time);

  // Confetti animation style for background
  const confettiStyle = {
    background: `
      radial-gradient(circle, rgba(255,255,255,0) 30%, rgba(255,255,255,0.7) 70%),
      linear-gradient(to right, #FFD700, #FF8C00, #FF5733, #C70039, #900C3F, #581845)
    `,
    backgroundSize: "400% 400%",
    animation: "confetti-gradient 5s ease infinite",
  };

  return (
    <div className="score-board rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center border border-gray-100 relative overflow-hidden">
      {/* Animated background glow effect */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-10 -z-10"
        style={confettiStyle}
      ></div>

      {/* Trophy icon */}
      <div className="flex justify-center mb-2">
        <Trophy className="text-yellow-500" size={40} />
      </div>

      <h2 className="text-3xl font-bold text-[#66220B] mb-4">
        Great Job! {performance.emoji}
      </h2>

      <div className="time-display flex items-center justify-center text-5xl font-bold text-[#F09000] mb-6">
        <Clock className="mr-2 text-[#F09000]" size={28} />
        <span className="font-mono">{formatTime(time)}</span>
      </div>

      <p className="text-lg text-gray-700 mb-8 px-4">{performance.message}</p>

      {/* Display save status */}
      {savedToDatabase && (
        <p className="text-sm text-green-600 mb-4">✓ Your progress has been saved!</p>
      )}

      {saveError && (
        <p className="text-sm text-red-600 mb-4">{saveError}</p>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
        <button
          className="play-again-button bg-gradient-to-r from-[#F09000] to-[#FF6B00] hover:from-[#D87D00] hover:to-[#E06000] text-black font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
          onClick={onPlayAgain}
        >
          <RotateCcw size={18} className="mr-2" />
          Play Again
        </button>

        <button
          className="analysis-button hover:bg-gray-50 text-[#66220B] font-bold py-3 px-6 border-2 border-[#66220B] rounded-full text-lg transition-all duration-300 hover:shadow-md flex items-center justify-center"
          onClick={() => setShowAnalysis(!showAnalysis)}
        >
          {showAnalysis ? (
            <>
              <ChevronUp size={18} className="mr-2" /> Hide Analysis
            </>
          ) : (
            <>
              <ChevronDown size={18} className="mr-2" /> Show Analysis
            </>
          )}
        </button>
      </div>

      {/* Decorative divider before the analysis */}
      {showAnalysis && (
        <div className="flex items-center justify-center mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-3/4"></div>
        </div>
      )}

      <ResultsAnalysis time={time} age={age} isVisible={showAnalysis} />

      {/* Subtle footer message */}
      <div className="mt-6 text-xs text-gray-400">
        Keep practicing to improve your skills!
      </div>
    </div>
  );
};

export default ScoreBoard;