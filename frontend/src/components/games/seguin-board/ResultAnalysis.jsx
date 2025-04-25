//ResultAnalysis.jsx
// import React from 'react';
import { performanceBenchmarks } from '../../../constants/gameConstants';

const ResultsAnalysis = ({ time, age, isVisible = false }) => {
  if (!isVisible) return null;
  
  // Get appropriate benchmark for the age
  const benchmark = performanceBenchmarks[age] || performanceBenchmarks[8]; // Default to age 8 if not found
  
  // Determine performance level
  let performanceLevel = 'needs_practice';
  if (time <= benchmark.excellent) {
    performanceLevel = 'excellent';
  } else if (time <= benchmark.good) {
    performanceLevel = 'good';
  } else if (time <= benchmark.average) {
    performanceLevel = 'average';
  }
  
  // Calculate percentile (approximate)
  const calculatePercentile = () => {
    if (performanceLevel === 'excellent') return '90-100th';
    if (performanceLevel === 'good') return '70-90th';
    if (performanceLevel === 'average') return '40-70th';
    return 'Below 40th';
  };
  
  // Generate personalized feedback
  const getFeedback = () => {
    switch (performanceLevel) {
      case 'excellent':
        return "Outstanding performance! Your visual processing and spatial awareness skills are highly developed. You completed the task very quickly with excellent precision.";
      case 'good':
        return "Great job! You showed strong visual processing and good spatial awareness. Your performance was better than many children your age.";
      case 'average':
        return "Good work! You completed the task at a typical pace for your age group. With practice, you can improve your speed while maintaining accuracy.";
      default:
        return "You completed the task! The Seguin Form Board helps develop important skills like visual processing and hand-eye coordination. Regular practice can help improve your performance.";
    }
  };
  
  // Get age-appropriate recommendations
  const getRecommendations = () => {
    if (performanceLevel === 'needs_practice') {
      return [
        "Try practicing with simpler puzzles first",
        "Focus on one shape at a time",
        "Take breaks if you feel frustrated",
        "Try to match shapes by looking at their features"
      ];
    }
    
    return [
      "Challenge yourself with more complex puzzles",
      "Try to beat your own time with each attempt",
      "Practice with similar spatial reasoning games",
      "Try the game with shape rotation for an extra challenge"
    ];
  };
  
  return (
    <div className="results-analysis mt-6 text-left bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-[#66220B] mb-3">Performance Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="font-semibold text-gray-700">Performance Level:</p>
          <p className={`text-lg ${
            performanceLevel === 'excellent' ? 'text-green-600' :
            performanceLevel === 'good' ? 'text-blue-600' :
            performanceLevel === 'average' ? 'text-yellow-600' : 'text-orange-600'
          }`}>
            {performanceLevel.charAt(0).toUpperCase() + performanceLevel.slice(1)}
          </p>
        </div>
        
        <div>
          <p className="font-semibold text-gray-700">Percentile Range:</p>
          <p className="text-lg">{calculatePercentile()}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="font-semibold text-gray-700 mb-1">Feedback:</p>
        <p className="text-gray-600">{getFeedback()}</p>
      </div>
      
      <div>
        <p className="font-semibold text-gray-700 mb-1">Recommendations:</p>
        <ul className="list-disc pl-5 text-gray-600">
          {getRecommendations().map((rec, index) => (
            <li key={index} className="mb-1">{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultsAnalysis;