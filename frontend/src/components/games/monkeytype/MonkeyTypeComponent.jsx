import React, { useEffect, useState, useRef } from "react";
import knownRhymesNoPunctuation from "../../../data/rhymesLinesNoPunctuation";
import RestartButton from "../../RestartButton";
import Results from "./Results";
import { calculateAccuracyPercentage, calculateWPM } from "../../../utils/helpers";
import { progressService } from "../../../utils/apiService";

// Enhanced UserTypings component with bigger, bolder, and glowy text
const UserTypings = ({ userInput = "", words = "", isDarkMode = false }) => {
  // Always declare hooks at the top level
  useEffect(() => {
    // Add the keyframes to the document
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);
    
    // Clean up on unmount
    return () => {
      if (document.getElementsByTagName('head')[0].contains(style)) {
        document.getElementsByTagName('head')[0].removeChild(style);
      }
    };
  }, []);

  // Early return if no words
  if (!words) return null;

  // Get appropriate class name based on character status
  const getCharClassName = (isCorrect, isIncorrect) => {
    if (isCorrect) return isDarkMode ? "text-green-300" : "text-green-600";
    if (isIncorrect) return "text-red-500 bg-red-100 dark:bg-red-900 dark:bg-opacity-30";
    return isDarkMode ? "text-gray-600" : "text-gray-400";
  };

  // Add glow effect style for text
  const glowStyle = {
    textShadow: "0 0 8px rgba(59, 130, 246, 0.6)",
    fontWeight: "600", // Bolder text
    fontSize: "2.5rem", // Bigger text (was 2xl/2rem)
    letterSpacing: "0.05em", // Slightly increase spacing for readability
  };

  return (
    <div className="relative">
      {/* Base text layer (the text to be typed) */}
      <div 
        className="tracking-wide font-light text-gray-400 dark:text-gray-600 opacity-0"
        style={glowStyle}
      >
        {words}
      </div>

      {/* User input overlay with character-by-character cursor */}
      <div 
        className="absolute top-0 left-0" 
        style={{ 
          ...glowStyle
        }}
      >
        {words.split("").map((char, index) => {
          const typedChar = index < userInput.length ? userInput[index] : "";
          const isCorrect = typedChar === char;
          const isIncorrect = typedChar && !isCorrect;
          const isCurrentPosition = index === userInput.length; // This identifies the current cursor position

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
              
              {/* Dashed cursor that shows the current position */}
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
    </div>
  );
};

// Custom hook for the typing game engine with start button functionality
const useTypingEngine = () => {
  const [state, setState] = useState("idle"); // idle, start, finish
  const [currentWords, setCurrentWords] = useState("");
  const [nextWords, setNextWords] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [completedTexts, setCompletedTexts] = useState(0);
  const intervalRef = useRef(null);
  const allTypedRef = useRef("");
  
  // Get random text passage
  const getRandomText = () => {
    const randomIndex = Math.floor(Math.random() * knownRhymesNoPunctuation.length);
    return knownRhymesNoPunctuation[randomIndex];
  };

  // Initialize texts
  const initializeTexts = () => {
    setCurrentWords(getRandomText());
    setNextWords(getRandomText());
  };

  // Progress to next text
  const progressToNextText = () => {
    setCompletedTexts(prev => prev + 1);
    setCurrentWords(nextWords);
    setNextWords(getRandomText());
    setTyped("");
    // Don't reset errors or totalTyped since we want to track across all texts
  };

  // Calculate errors in current typing segment
  const calculateCurrentErrors = (typedText, targetText) => {
    let errorCount = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] !== targetText[i]) {
        errorCount++;
      }
    }
    return errorCount;
  };

  // Start the game
  const startGame = () => {
    setState("start");
    setTimeLeft(60);
    setTyped("");
    setErrors(0);
    setTotalTyped(0);
    setTotalCorrect(0);
    setCompletedTexts(0);
    allTypedRef.current = "";
    initializeTexts();
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current);
          setState("finish");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Restart the game
  const restart = () => {
    setState("idle");
    setTimeLeft(60);
    setTyped("");
    setErrors(0);
    setTotalTyped(0);
    setTotalCorrect(0);
    setCompletedTexts(0);
    allTypedRef.current = "";
    clearInterval(intervalRef.current);
    // Don't automatically start - wait for button click
  };

  // Handle text completion and progression
  useEffect(() => {
    if (state === "start" && typed.length >= currentWords.length) {
      // Calculate errors for this segment
      const currentErrors = calculateCurrentErrors(typed, currentWords);
      
      // Track total typed and correct characters
      setTotalTyped(prev => prev + typed.length);
      setTotalCorrect(prev => prev + (typed.length - currentErrors));
      
      // Update total errors
      setErrors(prev => prev + currentErrors);
      
      // Save all typed text for reference
      allTypedRef.current += typed;
      
      // Move to next text segment
      progressToNextText();
    }
  }, [typed, currentWords, state]);

  // Handle keyboard input - only when in "start" state
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only accept keyboard input if game is in started state
      if (state !== "start") return;
      
      // Only allow letters, numbers, spaces, and punctuation
      const key = e.key;
      const isValidKey = 
        key.length === 1 || 
        key === " " || 
        key === "." || 
        key === "," || 
        key === "'" || 
        key === "\"" || 
        key === "-";
      
      if (isValidKey) {
        setTyped((prev) => prev + key);
      } else if (key === "Backspace") {
        setTyped((prev) => prev.slice(0, -1));
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return {
    state,
    currentWords,
    nextWords,
    timeLeft,
    typed,
    errors,
    totalTyped,
    totalCorrect,
    completedTexts,
    startGame,
    restart
  };
};

// Start Button Component
const StartButton = ({ onStart }) => {
  return (
    <button
      onClick={onStart}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
      style={{
        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
      }}
    >
      <div className="flex items-center justify-center">
        <span className="mr-2">Start Typing</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      </div>
    </button>
  );
};

// Main Monkey Type Component
const MonkeyTypeComponent = () => {
  const {
    state,
    currentWords,
    nextWords,
    timeLeft,
    typed,
    errors,
    totalTyped,
    totalCorrect,
    completedTexts,
    startGame,
    restart
  } = useTypingEngine();
  
  const [isVisible, setIsVisible] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  
  // Calculate real-time metrics
  const accuracy = totalTyped > 0 ? (totalCorrect / totalTyped) * 100 : 0;
  const wpm = calculateWPM(totalTyped, 60 - timeLeft);
  
  // Initial visibility animation
  useEffect(() => setIsVisible(true), []);

  // Save progress when game finishes
  useEffect(() => {
    if (state === "finish") {
      saveProgress();
    }
  }, [state]);

  // Save progress to database
  const saveProgress = async () => {
    try {
      // Default game duration
      const totalTime = 60;
      
      // Calculate actual time used (seconds)
      const timeUsed = Math.max(1, totalTime - timeLeft);
      
      // Prepare progress data with correct metrics and format
      // This matches what MonkeyTypePerformance expects
      const progressData = {
        gameType: 'monkey',
        completionTime: wpm, // Store WPM as the completionTime metric
        accuracy: accuracy,
        level: 1,
        date: new Date().toISOString(), // Add date for time series data
        // Add these fields explicitly to match what the chart component expects
        wpm: wpm,
        monkeyAccuracy: accuracy
      };
      
      console.log('Saving monkey game progress:', progressData);
      const response = await progressService.saveGameProgress(progressData);
      console.log('Monkey game progress saved:', response);
      
      setSavedProgress(true);
    } catch (error) {
      console.error('Error saving monkey game progress:', error);
    }
  };

  const restartGame = () => {
    setSavedProgress(false);
    restart();
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 py-10">
      <div
        className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-2xl w-full transform transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
        style={{ 
          boxShadow: '0 10px 25px rgba(0,122,255,0.1)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        {/* Game header with instructions */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-3 dark:text-white bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Tappy Type
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 px-4">
            Type the words below as quickly and accurately as you can. New text will appear as you complete each segment.
          </p>
        </div>

        {/* Game stats bar - always visible */}
        <div className="flex justify-between items-center mb-6 p-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <div
              className="relative h-10 w-10 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: timeLeft > 30 ? '#34C759' : timeLeft > 10 ? '#FF9500' : '#FF3B30',
                boxShadow: `0 0 10px ${timeLeft > 30 ? '#34C759' : timeLeft > 10 ? '#FF9500' : '#FF3B30'}`
              }}
            >
              <span className="text-white font-bold">{timeLeft}</span>
            </div>
            <span className="text-lg font-medium dark:text-white">seconds</span>
          </div>
          
          {/* Live stats - Only show in active game */}
          {state === "start" && (
            <div className="flex space-x-5">
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">WPM</div>
                <div className="text-lg font-bold text-blue-500">{wpm}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Accuracy</div>
                <div 
                  className="text-lg font-bold"
                  style={{ 
                    color: accuracy > 90 ? '#34C759' : 
                           accuracy > 70 ? '#FF9500' : '#FF3B30' 
                  }}
                >
                  {accuracy.toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Texts</div>
                <div className="text-lg font-bold text-indigo-500">{completedTexts}</div>
              </div>
            </div>
          )}
          
          {state === "finish" && (
            <RestartButton onRestart={restartGame} />
          )}
        </div>

        {/* Typing Area - Elevated and with better spacing */}
        <div 
          className="relative p-8 rounded-xl mb-6"
          style={{ 
            boxShadow: '0 4px 6px rgba(0,0,0,0.04)', 
            marginBottom: '2rem',
            minHeight: '160px'
          }}
        >
          {state === "idle" ? (
            /* Start button - only shown in idle state */
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-gray-500 mb-6 text-center">
                Ready to test your typing skills?
              </p>
              <StartButton onStart={startGame} />
            </div>
          ) : (
            /* Game content - only shown when game is active or finished */
            <>
              {/* Reference text (grey) */}
              <div className="mb-8 text-2xl tracking-wide font-light text-gray-400 dark:text-gray-500">
                {currentWords}
              </div>
              
              {/* User's typing (with 30px vertical gap) */}
              <div style={{ marginTop: '30px' }}>
                <UserTypings 
                  words={currentWords} 
                  userInput={typed} 
                  isDarkMode={false}
                />
              </div>
            </>
          )}
        </div>
        
        {/* Coming next preview */}
        {state === "start" && (
          <div className="border-l-4 border-gray-300 pl-4 mb-6 mt-3">
            <p className="text-sm italic text-gray-500 dark:text-gray-400">Coming next:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {nextWords.length > 50 ? nextWords.substring(0, 50) + "..." : nextWords}
            </p>
          </div>
        )}

        {/* Results */}
        <Results
          state={state}
          className="mt-8"
          errors={errors}
          accuracyPercentage={accuracy}
          total={totalTyped}
          timeLeft={timeLeft}
          savedProgress={savedProgress}
          totalTypingTime={60}
        />
      </div>
    </div>
  );
};

export default MonkeyTypeComponent;