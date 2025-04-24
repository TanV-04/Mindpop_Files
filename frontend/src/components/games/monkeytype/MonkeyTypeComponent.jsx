import React, { useEffect, useState, useRef } from "react";
import RestartButton from "../../RestartButton";
import Results from "./Results";
import { calculateAccuracyPercentage, calculateWPM } from "../../../utils/helpers";
import { progressService } from "../../../utils/apiService";
import { useParams } from "react-router-dom";
import Avatar from "./Avatar";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

// Age group configurations
const AGE_GROUPS = {
  "5-7": {
    initialTimer: 150, // 2.5 minutes
    minTimer: 120,    // 2 minutes
    initialLevel: "letters",
    avatarMessages: {
      correct: "Great job!",
      wrong: "Try again!",
      completed: "You're amazing!"
    },
    prompt: (level) => {
      switch(level) {
        case "letters": 
          return "Generate a simple typing exercise for 5-7 year olds focusing on letters and numbers. Use only uppercase letters A-Z and numbers 0-9 separated by spaces. Keep it very simple with 5-7 items total. Example: 'A B C 1 2 3'";
        case "simple":
          return "Generate a simple typing exercise for 5-7 year olds using 3-4 letter words. Create a sequence of 5-7 very simple words that a young child could type, separated by spaces. Example: 'cat dog sun ball happy'";
        default:
          return "Generate a simple typing exercise for young children with 5-7 items, alternating between letters and numbers. Example: 'A 1 B 2 C 3'";
      }
    }
  },
  "8-10": {
    initialTimer: 120, // 2 minutes
    minTimer: 90,     // 1.5 minutes
    initialLevel: "simple",
    avatarMessages: {
      correct: "Well done!",
      wrong: "Almost there!",
      completed: "Fantastic work!"
    },
    prompt: (level, count = 1) => {
      switch(level) {
        case "simple":
          if (count === 1) {
            return `Generate one simple, unique sentence typing exercise suitable for 8-10 year olds. 
                    Abosolutely no repetition of sentences.
                    Use simple vocabulary and keep the sentence under 10 words. 
                    Return only the sentence, without numbering. 
                    The sentence should be different from all previously generated sentences. Every sentence has to be a riddle.`;
          } else {
            return `Generate ${count} simple, unique sentence typing exercises suitable for 8-10 year olds. 
                    Each sentence should be different and not repeat any previous sentence structure or wording. 
                    Keep each sentence under 10 words. 
                    Return only the sentences as a JSON array of strings.`;
          }
        case "intermediate":
          return `Generate an intermediate typing exercise for 8-10 year olds. 
                  Create a meaningful sentence with 10-15 words using slightly more complex vocabulary. 
                  The sentence should be unique and not repeat previous content. 
                  Example: 'Children enjoy playing outside when the weather is nice and sunny.'`;
        default:
          return `Generate a typing exercise appropriate for 8-10 year olds with 10-15 words. 
                  The content should be unique and not repeat previous sentences. 
                  Example: 'My favorite subjects in school are math and science because they are interesting.'`;
      }
    }

  },
  "11-12": {
    initialTimer: 90,  // 1.5 minutes
    minTimer: 60,      // 1 minute
    initialLevel: "poems",
    avatarMessages: {
      correct: "Excellent!",
      wrong: "Focus!",
      completed: "Brilliant!"
    },
    prompt: (level) => {
      switch(level) {
        case "poems":
          return "Generate a short line from a children's poem or rhyme that would be appropriate for typing practice for 11-12 year olds. Keep it to 10-15 words. Example: 'Twinkle twinkle little star how I wonder what you are'";
        case "intermediate":
          return "Generate an interesting fact or short sentence appropriate for 11-12 year olds that would make good typing practice. Make it 15-20 words with slightly complex vocabulary. Example: 'The solar system consists of eight planets that orbit around the sun in elliptical paths.'";
        case "advanced":
          return "Generate a challenging typing exercise for 11-12 year olds. Create a meaningful sentence with 20+ words using complex vocabulary and concepts. Example: 'Quantum mechanics demonstrates that particles can exist in multiple states simultaneously until they are observed or measured.'";
        default:
          return "Generate a typing exercise appropriate for 11-12 year olds with 15-20 words. Example: 'Photosynthesis is the process by which plants convert sunlight into energy through chemical reactions in their leaves.'";
      }
    }
  }
};

// Fallback texts in case API fails
const FALLBACK_TEXTS = {
  "letters": ["A B C 1 2 3", "X Y Z 4 5 6", "M N O 7 8 9"],
  "simple": ["The cat sat on the mat.", "I like to play outside.", "My dog is very happy."],
  "poems": ["Twinkle twinkle little star", "Mary had a little lamb", "Humpty Dumpty sat on a wall"],
  "intermediate": ["The quick brown fox jumps over the lazy dog.", "Pack my box with five dozen liquor jugs."],
  "advanced": ["The juxtaposition of complex ideas creates cognitive dissonance in many readers."]
};

// Enhanced UserTypings component with bigger, bolder, and glowy text
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
const useAITextGenerator = (ageGroup) => {
  const [currentLevel, setCurrentLevel] = useState(AGE_GROUPS[ageGroup].initialLevel);
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getAIText = async (level) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = AGE_GROUPS[ageGroup].prompt(level);
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
      const fallbacks = FALLBACK_TEXTS[level] || FALLBACK_TEXTS[AGE_GROUPS[ageGroup].initialLevel];
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
const useTypingEngine = (ageGroup) => {
  const ageConfig = AGE_GROUPS[ageGroup];
  const { getAIText, adjustLevel, currentLevel, isLoading, error } = useAITextGenerator(ageGroup);
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
const StartButton = ({ onStart }) => {
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

// Main Monkey Type Component
const MonkeyTypeComponent = () => {
  const params = useParams();
  const storedAgeGroup = localStorage.getItem("userAgeGroup");
  const ageGroup = params.ageGroup || storedAgeGroup || "8-10";
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
    avatarMessage,
    currentLevel,
    isLoading,
    error,
    startGame,
    restart
  } = useTypingEngine(ageGroup);
  
  const [isVisible, setIsVisible] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  
  const accuracy = totalTyped > 0 ? (totalCorrect / totalTyped) * 100 : 0;
  const wpm = calculateWPM(totalTyped, AGE_GROUPS[ageGroup].initialTimer - timeLeft);
  
  useEffect(() => setIsVisible(true), []);

  useEffect(() => {
    if (state === "finish") {
      saveProgress();
    }
  }, [state]);

  const saveProgress = async () => {
    try {
      const progressData = {
        gameType: 'monkey',
        completionTime: wpm,
        accuracy: accuracy,
        level: currentLevel,
        ageGroup: ageGroup,
        date: new Date().toISOString(),
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
            <div className="text-white text-lg">Generating new text...</div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>Couldn't generate new text. Using practice materials instead.</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-3 dark:text-white text-black">
            {ageGroup === "5-7" ? "Fun Typing for Kids" : 
             ageGroup === "8-10" ? "Tappy Type" : "Advanced Typing Challenge"}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 px-4">
            {ageGroup === "5-7" ? "Type the letters and words as they appear. Let's learn together!" : 
             ageGroup === "8-10" ? "Type the words below as quickly and accurately as you can." : 
             "Challenge yourself with complex texts. Accuracy and speed both matter!"}
          </p>
        </div>

        <div className="flex justify-between items-center mb-6 p-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <div
              className="relative h-10 w-10 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: timeLeft > AGE_GROUPS[ageGroup].initialTimer/2 ? '#34C759' : 
                                timeLeft > AGE_GROUPS[ageGroup].initialTimer/4 ? '#FF9500' : '#FF3B30',
                boxShadow: `0 0 10px ${timeLeft > AGE_GROUPS[ageGroup].initialTimer/2 ? '#34C759' : 
                            timeLeft > AGE_GROUPS[ageGroup].initialTimer/4 ? '#FF9500' : '#FF3B30'}`
              }}
            >
              <span className="text-white font-bold">{formatTime(timeLeft)}</span>
            </div>
            <span className="text-lg font-medium dark:text-white">time left</span>
          </div>
          
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
                <div className="text-sm text-gray-500 dark:text-gray-400">Level</div>
                <div className="text-lg font-bold text-indigo-500">{currentLevel}</div>
              </div>
            </div>
          )}
          
          {state === "finish" && (
            <RestartButton onRestart={restartGame} />
          )}
        </div>

        {avatarMessage && (
          <div className="mb-4 flex justify-center">
            <Avatar ageGroup={ageGroup} message={avatarMessage} />
          </div>
        )}

        <div 
          className="relative p-8 rounded-xl mb-6"
          style={{ 
            boxShadow: '0 4px 6px rgba(0,0,0,0.04)', 
            marginBottom: '2rem',
            minHeight: '160px'
          }}
        >
          {state === "idle" ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-gray-500 mb-6 text-center">
                {ageGroup === "5-7" ? "Ready to learn typing with fun?" : 
                 "Ready to test your typing skills?"}
              </p>
              <StartButton onStart={startGame} />
            </div>
          ) : (
            <>
              <div className="mb-8 text-2xl tracking-wide font-light text-gray-400 dark:text-gray-500">
                {currentWords}
              </div>
              
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
        
        {state === "start" && (
          <div className="border-l-4 border-gray-300 pl-4 mb-6 mt-3">
            <p className="text-sm italic text-gray-500 dark:text-gray-400">Coming next:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {nextWords.length > 50 ? nextWords.substring(0, 50) + "..." : nextWords}
            </p>
          </div>
        )}

        <Results
          state={state}
          className="mt-8"
          errors={errors}
          accuracyPercentage={accuracy}
          total={totalTyped}
          timeLeft={timeLeft}
          savedProgress={savedProgress}
          totalTypingTime={AGE_GROUPS[ageGroup].initialTimer}
          ageGroup={ageGroup}
        />
      </div>
    </div>
  );
};

export default MonkeyTypeComponent;