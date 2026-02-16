//
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResultsAnalysis from "./ResultAnalysis";
import { progressService } from "../../../utils/apiService"


const ScoreBoard = ({ time, age, onPlayAgain }) => {
  const navigate = useNavigate();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [savedToDatabase, setSavedToDatabase] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const saveProgress = async () => {
      if (savedToDatabase || time <= 0) return;

      try {
        // Determine age group
        let ageGroup = "8-10";
        if (age <= 8) ageGroup = "6-8";
        else if (age >= 9 && age <= 10) ageGroup = "8-10";
        else if (age >= 11 && age <= 12) ageGroup = "10-12";
        else if (age >= 13) ageGroup = "12-14";

        await progressService.saveGameProgress({
          gameType: "seguin",
          completionTime: Number(time),
          accuracy: 100,
          level: age < 7 ? 1 : age > 10 ? 3 : 2,
          ageGroup,
        });

        setSavedToDatabase(true);
      } catch (error) {
        console.error("Error saving progress:", error);
        setSaveError("Failed to save progress");
      }
    };

    saveProgress();
  }, [time, age, savedToDatabase]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getPerformanceMessage = () => {
    const benchmarks = {
      5: { excellent: 60, good: 90 },
      6: { excellent: 50, good: 80 },
      7: { excellent: 45, good: 70 },
      8: { excellent: 40, good: 65 },
      9: { excellent: 35, good: 60 },
      10: { excellent: 30, good: 55 },
      11: { excellent: 25, good: 50 },
      12: { excellent: 20, good: 45 },
    };

    const benchmark = benchmarks[age] || benchmarks[10];

    if (time <= benchmark.excellent) {
      return { message: "Excellent! Super fast! 🌟", color: "#10B981" };
    } else if (time <= benchmark.good) {
      return { message: "Great work! 🎉", color: "#3B82F6" };
    } else if (time < 90) {
      return { message: "Good job! 👍", color: "#F59E0B" };
    }
    return { message: "Well done! Keep practicing! 😊", color: "#EF4444" };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="score-board">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="score-title">Amazing Work!</h2>
        <div className="score-time">{formatTime(time)}</div>
        <p
          className="text-xl font-semibold mb-4"
          style={{ color: performance.color }}
        >
          {performance.message}
        </p>

        {savedToDatabase && (
          <p className="text-sm text-green-600 mb-2">
            ✓ Progress saved successfully!
          </p>
        )}
        {saveError && (
          <p className="text-sm text-red-600 mb-2">{saveError}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
        <button className="game-button" onClick={onPlayAgain}>
          🔄 Play Again
        </button>
        <button
          className="game-button secondary-button"
          onClick={() => setShowAnalysis(!showAnalysis)}
        >
          {showAnalysis ? "Hide Analysis ▲" : "Show Analysis ▼"}
        </button>
        <button
          className="game-button secondary-button"
          onClick={() => navigate("/games")}
        >
          ← Back to Games
        </button>
      </div>

      {showAnalysis && <ResultsAnalysis time={time} age={age} />}
    </div>
  );
};

export default ScoreBoard;