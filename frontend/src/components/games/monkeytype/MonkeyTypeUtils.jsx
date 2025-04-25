import { useState, useEffect, useRef } from "react";
import { calculateAccuracyPercentage, calculateWPM } from "../../../utils/helpers";
import { progressService } from "../../../utils/apiService";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

// Fallback texts in case API fails
export const FALLBACK_TEXTS = {
  "letters": ["A B C 1 2 3", "X Y Z 4 5 6", "M N O 7 8 9"],
  "simple": ["The cat sat on the mat.", "I like to play outside.", "My dog is very happy."],
  "poems": ["Twinkle twinkle little star", "Mary had a little lamb", "Humpty Dumpty sat on a wall"],
  "intermediate": ["The quick brown fox jumps over the lazy dog.", "Pack my box with five dozen liquor jugs."],
  "advanced": ["The juxtaposition of complex ideas creates cognitive dissonance in many readers."]
};

// Enhanced UserTypings component with bigger, bolder, and glowy text
export const UserTypings = ({ userInput = "", words = "", isDarkMode = false }) => {
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

  const glowStyle = {
    textShadow: "0 0 8px rgba(59, 130, 246, 0.6)",
    fontWeight: "600",
    fontSize: "2.5rem",
    letterSpacing: "0.05em",
  };

  return (
    <div className="relative">
      <div 
        className="tracking-wide font-light text-gray-400 dark:text-gray-600 opacity-0"
        style={glowStyle}
      >
        {words}
      </div>

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
    </div>
  );
};

// Custom hook for AI text generation
export const useAITextGenerator = (ageGroup, ageConfig) => {
  const [currentLevel, setCurrentLevel] = useState(ageConfig.initialLevel);
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getAIText = async (level) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = ageConfig.prompt(level);
      const completion = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });
      
      const generatedText = completion.choices[0]?.message?.content;
      if (generatedText) {
        const cleanedText = generatedText
          .replace(/"/g, '')
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        return cleanedText;
      }
      throw new Error("No text generated");
    } catch (err) {
      console.error("Error generating text with Groq:", err);
      setError(err);
      const fallbacks = FALLBACK_TEXTS[level] || FALLBACK_TEXTS[ageConfig.initialLevel];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    } finally {
      setIsLoading(false);
    }
  };
  
  const adjustLevel = (accuracy, wpm) => {
    setPerformanceHistory(prev => [...prev, { accuracy, wpm }]);
    
    const avgAccuracy = performanceHistory.reduce((sum, item) => sum + item.accuracy, accuracy) / 
                        (performanceHistory.length + 1);
    const avgWPM = performanceHistory.reduce((sum, item) => sum + item.wpm, wpm) / 
                   (performanceHistory.length + 1);
    
    let newLevel = currentLevel;
    
    if (ageGroup === "5-7") {
      if (avgAccuracy > 90 && avgWPM > 10 && currentLevel === "letters") {
        newLevel = "simple";
      } else if (avgAccuracy < 80 && currentLevel === "simple") {
        newLevel = "letters";
      }
    } else if (ageGroup === "8-10") {
      if (avgAccuracy > 85 && avgWPM > 20 && currentLevel === "simple") {
        newLevel = "intermediate";
      } else if (avgAccuracy < 70 || avgWPM < 15) {
        newLevel = "simple";
      }
    } else if (ageGroup === "11-12") {
      if (avgAccuracy > 80 && avgWPM > 30 && currentLevel === "poems") {
        newLevel = "intermediate";
      } else if (avgAccuracy > 85 && avgWPM > 35 && currentLevel === "intermediate") {
        newLevel = "advanced";
      } else if ((avgAccuracy < 65 || avgWPM < 20) && currentLevel !== "poems") {
        newLevel = currentLevel === "advanced" ? "intermediate" : "poems";
      }
    }
    
    if (newLevel !== currentLevel) {
      setCurrentLevel(newLevel);
    }
    
    return newLevel;
  };
  
  return { getAIText, adjustLevel, currentLevel, isLoading, error };
};

// Custom hook for the typing game engine
export const useTypingEngine = (ageGroup, ageConfig) => {
  const { getAIText, adjustLevel, currentLevel, isLoading, error } = useAITextGenerator(ageGroup, ageConfig);
  const [state, setState] = useState("idle");
  const [currentWords, setCurrentWords] = useState("");
  const [nextWords, setNextWords] = useState("");
  const [timeLeft, setTimeLeft] = useState(ageConfig.initialTimer);
  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [completedTexts, setCompletedTexts] = useState(0);
  const intervalRef = useRef(null);
  const allTypedRef = useRef("");
  const [avatarMessage, setAvatarMessage] = useState("");
  
  const initializeTexts = async () => {
    try {
      const current = await getAIText(currentLevel);
      const next = await getAIText(currentLevel);
      setCurrentWords(current);
      setNextWords(next);
    } catch (err) {
      console.error("Error initializing texts:", err);
      const fallbacks = FALLBACK_TEXTS[currentLevel] || FALLBACK_TEXTS[ageConfig.initialLevel];
      setCurrentWords(fallbacks[0]);
      setNextWords(fallbacks[1]);
    }
  };

  const progressToNextText = async () => {
    setCompletedTexts(prev => prev + 1);
    setCurrentWords(nextWords);
    
    try {
      const next = await getAIText(currentLevel);
      setNextWords(next);
    } catch (err) {
      console.error("Error generating next text:", err);
      const fallbacks = FALLBACK_TEXTS[currentLevel] || FALLBACK_TEXTS[ageConfig.initialLevel];
      setNextWords(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    }
    
    setTyped("");
    setAvatarMessage(ageConfig.avatarMessages.completed);
    setTimeout(() => setAvatarMessage(""), 2000);
  };

  const calculateCurrentErrors = (typedText, targetText) => {
    let errorCount = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] !== targetText[i]) {
        errorCount++;
      }
    }
    return errorCount;
  };

  const startGame = async () => {
    setState("start");
    setTimeLeft(ageConfig.initialTimer);
    setTyped("");
    setErrors(0);
    setTotalTyped(0);
    setTotalCorrect(0);
    setCompletedTexts(0);
    allTypedRef.current = "";
    await initializeTexts();
    
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
      
      if (timeLeft > ageConfig.minTimer) {
        const accuracy = totalTyped > 0 ? (totalCorrect / totalTyped) * 100 : 0;
        const wpm = calculateWPM(totalTyped, ageConfig.initialTimer - timeLeft);
        
        if (accuracy > (ageGroup === "5-7" ? 85 : ageGroup === "8-10" ? 80 : 75) && 
            wpm > (ageGroup === "5-7" ? 10 : ageGroup === "8-10" ? 20 : 30)) {
          setTimeLeft(prev => Math.max(ageConfig.minTimer, prev - 2));
        }
      }
    }, 1000);
  };

  const restart = () => {
    setState("idle");
    setTimeLeft(ageConfig.initialTimer);
    setTyped("");
    setErrors(0);
    setTotalTyped(0);
    setTotalCorrect(0);
    setCompletedTexts(0);
    allTypedRef.current = "";
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (state === "start" && typed.length >= currentWords.length) {
      const currentErrors = calculateCurrentErrors(typed, currentWords);
      const currentCorrect = typed.length - currentErrors;
      
      setTotalTyped(prev => prev + typed.length);
      setTotalCorrect(prev => prev + currentCorrect);
      setErrors(prev => prev + currentErrors);
      
      allTypedRef.current += typed;
      
      if (currentErrors === 0) {
        setAvatarMessage(ageConfig.avatarMessages.correct);
      } else {
        setAvatarMessage(ageConfig.avatarMessages.wrong);
      }
      setTimeout(() => setAvatarMessage(""), 1500);
      
      const accuracy = (currentCorrect / typed.length) * 100;
      const wpm = calculateWPM(typed.length, 1);
      adjustLevel(accuracy, wpm);
      
      progressToNextText();
    }
  }, [typed, currentWords, state]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (state !== "start") return;
      
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
    avatarMessage,
    currentLevel,
    isLoading,
    error,
    startGame,
    restart
  };
};

// Start Button Component
export const StartButton = ({ onStart }) => {
  return (
    <button
      onClick={onStart}
      className="bg-[#F09000] hover:bg-[#C07000] text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
      style={{
        backgroundColor: '#F09000',
        color: 'black',
        boxShadow: '0 4px 14px rgba(240, 144, 0, 0.4)',
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