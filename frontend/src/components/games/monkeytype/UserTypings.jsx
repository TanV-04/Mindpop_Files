import React from "react";

const UserTypings = ({ userInput = "", words = "", isDarkMode = false }) => {
  if (!words) return null;

  // Get appropriate class name based on character status
  const getCharClassName = (isCorrect, isIncorrect) => {
    if (isCorrect) return isDarkMode ? "text-green-300" : "text-green-600";
    if (isIncorrect) return "text-red-500 bg-red-100 dark:bg-red-900 dark:bg-opacity-30";
    return isDarkMode ? "text-gray-600" : "text-gray-400";
  };

  return (
    <div className="relative">
      {/* Base text layer (the text to be typed) */}
      <div className="text-2xl tracking-wide font-light text-gray-400 dark:text-gray-600 opacity-0">
        {words}
      </div>

      {/* User input overlay with cursor */}
      <div 
        className="absolute top-0 left-0 border-r-2 border-blue-500 dark:border-blue-400" 
        style={{ 
          borderRightWidth: userInput.length > 0 ? '2px' : '0',
          animation: 'cursor-blink 1s step-end infinite'
        }}
      >
        {words.split("").map((char, index) => {
          const typedChar = index < userInput.length ? userInput[index] : "";
          const isCorrect = typedChar === char;
          const isIncorrect = typedChar && !isCorrect;

          return (
            <span
              key={index}
              className={`${getCharClassName(isCorrect, isIncorrect)}`}
              style={{
                textDecoration: isIncorrect ? 'underline' : 'none',
                textDecorationColor: isIncorrect ? 'red' : 'transparent'
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Add CSS animation for the cursor */}
      <style jsx="true">{`
        @keyframes cursor-blink {
          0%, 100% { 
            border-right-color: ${isDarkMode ? 'rgba(96, 165, 250, 0.7)' : 'rgba(59, 130, 246, 0.7)'};
          }
          50% { 
            border-right-color: transparent; 
          }
        }
      `}</style>
    </div>
  );
};

export default UserTypings;