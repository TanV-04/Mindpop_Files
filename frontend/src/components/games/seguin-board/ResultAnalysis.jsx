import { performanceBenchmarks } from '../../../constants/gameConstants';

const ResultsAnalysis = ({ time, age, isVisible = false }) => {
  if (!isVisible) return null;
  
  // Get appropriate benchmark for the age
  // Use age 10 as default if exact age not found in benchmarks
  const benchmark = performanceBenchmarks[age] || performanceBenchmarks[10]; 
  
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
  
  // Generate personalized feedback based on age group
  const getFeedback = () => {
    // Determine age group for more targeted feedback
    const isYoungerChild = age <= 8;
    const isTeen = age >= 13;
    
    // Feedback templates by performance level and age group
    const feedbackTemplates = {
      excellent: {
        young: "Outstanding performance! Your visual processing skills are developing very well for your age. You're showing excellent ability to recognize shapes and match them quickly.",
        middle: "Excellent work! Your visual processing and spatial awareness skills are highly developed. You completed the task much faster than most kids your age.",
        teen: "Excellent performance! Your spatial reasoning and processing speed are very well developed. You completed the task with great efficiency."
      },
      good: {
        young: "Great job! You're showing strong visual skills and good hand-eye coordination for your age. Keep up the good work!",
        middle: "Great work! You showed strong visual processing and good spatial awareness, performing better than many kids your age.",
        teen: "Good work! Your spatial reasoning skills are solid, and you demonstrated good processing speed compared to your peers."
      },
      average: {
        young: "Good work! You completed the puzzle at a normal pace for children your age. Keep practicing to get even better!",
        middle: "Good effort! You completed the task at a typical pace for your age group. Regular practice will help you improve.",
        teen: "Solid work! You performed at an expected level for your age group. With practice, you can improve your efficiency."
      },
      needs_practice: {
        young: "You finished the puzzle! This game helps you learn to match shapes better. Let's practice more to get faster!",
        middle: "You completed the challenge! With regular practice, your spatial skills and processing speed will improve.",
        teen: "Task completed! Regular practice with these types of spatial tasks can significantly improve your performance."
      }
    };
    
    // Select the right template based on age group and performance
    if (isYoungerChild) {
      return feedbackTemplates[performanceLevel].young;
    } else if (isTeen) {
      return feedbackTemplates[performanceLevel].teen;
    } else {
      return feedbackTemplates[performanceLevel].middle;
    }
  };
  
  // Get age-appropriate recommendations
  const getRecommendations = () => {
    // Different recommendations based on age and performance
    if (age <= 8) {
      // Recommendations for younger children
      if (performanceLevel === 'needs_practice') {
        return [
          "Try simpler puzzles with fewer shapes first",
          "Take your time and focus on one shape at a time",
          "Look for matching shapes in everyday objects",
          "Practice drawing different shapes to learn their features"
        ];
      } else {
        return [
          "Try puzzles with more pieces for a bigger challenge",
          "Practice against a timer to improve speed",
          "Try to recognize shapes without looking at the outlines first",
          "Look for similarities between different shapes"
        ];
      }
    } else if (age <= 12) {
      // Recommendations for middle age group (9-12)
      if (performanceLevel === 'needs_practice') {
        return [
          "Focus on the unique features of each shape",
          "Try to group similar shapes together",
          "Practice with different shape-matching games",
          "Try to improve your time with each attempt"
        ];
      } else {
        return [
          "Challenge yourself with more complex puzzles",
          "Try puzzles with rotated shapes for an extra challenge",
          "Practice quickly identifying shapes from different angles",
          "Try spatial reasoning games with time pressure"
        ];
      }
    } else {
      // Recommendations for teens (13+)
      if (performanceLevel === 'needs_practice') {
        return [
          "Practice identifying shapes quickly without moving them first",
          "Try different strategies for approaching the puzzle",
          "Focus on improving your visual scanning techniques",
          "Break down the task into smaller steps"
        ];
      } else {
        return [
          "Try 3D spatial reasoning challenges",
          "Practice with shape-based logic puzzles",
          "Time yourself and work on beating your personal best",
          "Explore more complex visual-spatial tasks"
        ];
      }
    }
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