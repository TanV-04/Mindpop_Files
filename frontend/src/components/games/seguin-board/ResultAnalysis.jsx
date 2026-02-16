//frontend\src\components\games\seguin-board\ResultAnalysis.jsx
import { performanceBenchmarks } from "../../../constants/gameConstants";

const ResultsAnalysis = ({ time, age }) => {
  const benchmark = performanceBenchmarks[age] || performanceBenchmarks[10];

  let performanceLevel = "needs_practice";
  if (time <= benchmark.excellent) performanceLevel = "excellent";
  else if (time <= benchmark.good) performanceLevel = "good";
  else if (time <= benchmark.average) performanceLevel = "average";

  const performanceColors = {
    excellent: "#10B981",
    good: "#3B82F6",
    average: "#F59E0B",
    needs_practice: "#EF4444",
  };

  const performanceLabels = {
    excellent: "Excellent",
    good: "Good",
    average: "Average",
    needs_practice: "Needs Practice",
  };

  const getPercentile = () => {
    if (performanceLevel === "excellent") return "90-100th";
    if (performanceLevel === "good") return "70-90th";
    if (performanceLevel === "average") return "40-70th";
    return "Below 40th";
  };

  const getFeedback = () => {
    const isYounger = age <= 8;
    const isTeen = age >= 13;

    const feedback = {
      excellent: {
        young:
          "Outstanding! Your visual skills are developing very well for your age.",
        middle:
          "Excellent work! Your spatial awareness is highly developed for your age.",
        teen:
          "Excellent performance! Your spatial reasoning and processing speed are very well developed.",
      },
      good: {
        young:
          "Great job! You're showing strong visual skills for your age.",
        middle:
          "Great work! You showed strong visual processing and good spatial awareness.",
        teen:
          "Good work! Your spatial reasoning skills are solid compared to your peers.",
      },
      average: {
        young:
          "Good work! You completed the puzzle at a normal pace for your age.",
        middle:
          "Good effort! You performed at a typical pace for your age group.",
        teen:
          "Solid work! You performed at an expected level. Practice will help you improve.",
      },
      needs_practice: {
        young:
          "You finished! This game helps you learn to match shapes better. Keep practicing!",
        middle:
          "Task completed! Regular practice will improve your spatial skills.",
        teen:
          "Task completed! Regular practice with spatial tasks will improve your performance.",
      },
    };

    if (isYounger) return feedback[performanceLevel].young;
    if (isTeen) return feedback[performanceLevel].teen;
    return feedback[performanceLevel].middle;
  };

  const getRecommendations = () => {
    if (age <= 8) {
      return performanceLevel === "needs_practice"
        ? [
            "Try simpler puzzles first",
            "Take your time with each shape",
            "Look for matching shapes in everyday objects",
            "Practice drawing different shapes",
          ]
        : [
            "Try puzzles with more pieces",
            "Practice against a timer",
            "Try to recognize shapes without looking at outlines first",
            "Challenge yourself with harder levels",
          ];
    } else if (age <= 12) {
      return performanceLevel === "needs_practice"
        ? [
            "Focus on the unique features of each shape",
            "Group similar shapes together",
            "Practice with different shape-matching games",
            "Try to improve your time with each attempt",
          ]
        : [
            "Challenge yourself with more complex puzzles",
            "Try puzzles with rotated shapes",
            "Practice spatial reasoning games",
            "Work on improving your personal best time",
          ];
    } else {
      return performanceLevel === "needs_practice"
        ? [
            "Practice identifying shapes quickly",
            "Try different strategies",
            "Focus on visual scanning techniques",
            "Break down the task into smaller steps",
          ]
        : [
            "Try 3D spatial reasoning challenges",
            "Practice with shape-based logic puzzles",
            "Time yourself and beat your personal best",
            "Explore more complex visual-spatial tasks",
          ];
    }
  };

  return (
    <div className="analysis-card">
      <h3 className="analysis-title">Performance Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="font-semibold text-gray-700 mb-2">Performance Level:</p>
          <span
            className="performance-badge"
            style={{ background: performanceColors[performanceLevel] }}
          >
            {performanceLabels[performanceLevel]}
          </span>
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-2">Percentile Range:</p>
          <p className="text-xl font-bold" style={{ color: "#F09000" }}>
            {getPercentile()}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-700 mb-2">Feedback:</p>
        <p className="text-gray-600 leading-relaxed">{getFeedback()}</p>
      </div>

      <div>
        <p className="font-semibold text-gray-700 mb-2">Recommendations:</p>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          {getRecommendations().map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultsAnalysis;