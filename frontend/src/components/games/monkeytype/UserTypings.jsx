import React, { useEffect } from "react";

const UserTypings = ({ userInput = "", words = "", isDarkMode = false }) => {
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);
    
    return () => {
      if (document.getElementsByTagName('head')[0].contains(style)) {
        document.getElementsByTagName('head')[0].removeChild(style);
      }
    };
  }, []);

  if (!words) return null;

  const getCharClassName = (isCorrect, isIncorrect) => {
    if (isCorrect) return isDarkMode ? "text-green-300" : "text-green-600";
    if (isIncorrect) return "text-red-500 bg-red-100 dark:bg-red-900 dark:bg-opacity-30";
    return isDarkMode ? "text-gray-600" : "text-gray-400";
  };

  // Responsive font size using clamp for smooth sizing across devices
  const responsiveText = {
    fontWeight: "600",
    fontSize: "clamp(1.25rem, 5vw, 2.5rem)", // Responsive font sizing
    letterSpacing: "0.05em",
    textShadow: "0 0 8px rgba(59, 130, 246, 0.6)",
  };

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Hidden text that establishes the layout */}
      <div 
        className="tracking-wide font-light text-gray-400 dark:text-gray-600 opacity-0 break-words w-full"
        style={responsiveText}
      >
        {words}
      </div>

      {/* Interactive overlay with user input highlighting */}
      <div 
        className="absolute top-0 left-0 w-full break-words"
        style={responsiveText}
      >
        {words.split("").map((char, index) => {
          const typedChar = index < userInput.length ? userInput[index] : "";
          const isCorrect = typedChar === char;
          const isIncorrect = typedChar && !isCorrect;
          const isCurrentPosition = index === userInput.length;

          return (
            <span
              key={index}
              className={`${getCharClassName(isCorrect, isIncorrect)} relative`}
              style={{
                textDecoration: isIncorrect ? 'underline' : 'none',
                textDecorationColor: isIncorrect ? 'red' : 'transparent'
              }}
            >
              {char}
              
              {isCurrentPosition && (
                <span 
                  className="absolute"
                  style={{
                    left: 0,
                    bottom: "-2px",
                    height: "3px",
                    width: "100%",
                    borderBottom: "3px dashed #3B82F6",
                    animation: "cursorBlink 1s step-end infinite",
                    boxShadow: "0 0 8px rgba(59, 130, 246, 0.6)",
                    zIndex: 10
                  }}
                />
              )}
            </span>
          );
        })}
      </div>

      {/* Add responsive styling for different screen sizes */}
      <style jsx="true">{`
        @media (max-width: 640px) {
          /* Small mobile adjustments */
          .break-words {
            word-break: break-word;
          }
        }
      `}</style>
    </div>
  );
};

export default UserTypings;