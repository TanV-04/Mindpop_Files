import React, { useEffect, useState, useRef } from "react";
import RestartButton from "../../RestartButton";
import Results from "./Results";
import {
  calculateAccuracyPercentage,
  calculateWPM,
} from "../../../utils/helpers";
import { progressService } from "../../../utils/apiService";
import { useParams } from "react-router-dom";
import Avatar from "./Avatar";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Age group configurations with improved educational prompts
const AGE_GROUPS = {
  "5-7": {
    initialTimer: 150, // 2.5 minutes
    minTimer: 120, // 2 minutes
    initialLevel: 1,
    avatarMessages: {
      correct: "Great job!",
      wrong: "Try again!",
      completed: "You're amazing!",
    },
    prompt: (level, count = 1) => {
      if (count === 1) {
        return `Generate one unique simple sentence suitable for a 5-7 year old practicing typing.
                The sentence must teach something educational like:
                - Basic science facts (example: "fish live in water")
                - Simple life skills (example: "always wash your hands")
                - Positive social behaviors (example: "sharing toys is nice")
                - Basic math concepts (example: "two plus two is four")
                - Nature facts (example: "trees give us oxygen")
                
                The sentence should be 3 to 5 words long with no punctuation or special characters.
                Use basic vocabulary appropriate for early readers.
                Return ONLY the sentence without any extra text.`;
      } else {
        return `Generate ${count} unique simple sentences suitable for 5-7 year olds for typing practice.
                Each sentence must be 3 to 5 words long.
                Each sentence should teach something educational like basic science, life skills, 
                social behaviors, math concepts, or nature facts.
                Use only basic vocabulary that early readers would know.
                No numbers or random letter sequences.
                No punctuation or special characters.
                Return ONLY a JSON array of strings like: ["fish live in water", "always wash your hands"]`;
      }
    },
  },
  "8-10": {
    initialTimer: 120, // 2 minutes
    minTimer: 90, // 1.5 minutes
    initialLevel: 1,
    avatarMessages: {
      correct: "Well done!",
      wrong: "Almost there!",
      completed: "Fantastic work!",
    },
    prompt: (level, count = 1) => {
      if (count === 1) {
        return `Generate one interesting sentence for 8-10 year olds typing practice.
                The sentence should be educational and focus on one of these topics:
                - Science facts (example: "some dinosaurs had feathers")
                - World geography (example: "the amazon river is very long")
                - Historical facts (example: "ancient egyptians built the pyramids")
                - Health and nutrition (example: "vegetables help you grow strong")
                - Space or astronomy (example: "mars is the red planet")
                
                The sentence should be 6-10 words long with no punctuation.
                Use vocabulary that 8-10 year olds would understand.
                Return ONLY the sentence with no other text.`;
      } else {
        return `Generate ${count} educational sentences for 8-10 year olds typing practice.
                Each sentence should be 6-10 words long with no punctuation.
                Each sentence should teach something about science, geography, history, health, or space.
                All sentences must be completely unique and different from each other.
                Use vocabulary appropriate for 8-10 year olds.
                Return ONLY a JSON array like: ["some dinosaurs had feathers", "the amazon river is very long"]`;
      }
    },
  },
  "11-12": {
    initialTimer: 90, // 1.5 minutes
    minTimer: 60, // 1 minute
    initialLevel: 1,
    avatarMessages: {
      correct: "Excellent!",
      wrong: "Focus!",
      completed: "Brilliant!",
    },
    prompt: (level, count = 1) => {
      if (count === 1) {
        return `Generate one interesting and educational sentence for 11-12 year olds typing practice.
                The sentence should focus on one of these topics:
                - Advanced science concepts (example: "gravity pulls objects toward each other")
                - Cultural diversity (example: "people celebrate different holidays around the world")
                - Environmental awareness (example: "recycling helps protect our planet from pollution")
                - Technology and innovation (example: "computers use binary code to process information")
                - Critical thinking (example: "evidence helps us determine what is true")
                
                The sentence should be 10-15 words long with no punctuation.
                Use vocabulary that challenges 11-12 year olds but remains understandable.
                Return ONLY the sentence with no other text.`;
      } else {
        return `Generate ${count} educational sentences for 11-12 year olds typing practice.
                Each sentence should be 10-15 words long with no punctuation.
                Each sentence should teach something about advanced science, cultural diversity, 
                environmental awareness, technology, or critical thinking.
                All sentences must be completely unique and different from each other.
                Use vocabulary that challenges 11-12 year olds but remains understandable.
                Return ONLY a JSON array like: ["gravity pulls objects toward each other", "people celebrate different holidays around the world"]`;
      }
    },
  },
};

// Fallback texts in case API fails - updated to be more educational
const FALLBACK_TEXTS = {
  "5-7": [
    "always brush your teeth",
    "plants need water",
    "birds build nests",
    "fish swim in water",
    "eat healthy food",
  ],
  "8-10": [
    "the brain controls all body functions",
    "planets orbit around the sun",
    "water freezes at zero degrees celsius",
    "reading books helps grow your vocabulary",
    "exercise keeps your body healthy",
  ],
  "11-12": [
    "photosynthesis is how plants make their food",
    "the constitution protects citizens rights",
    "learning new languages connects people across cultures",
    "the water cycle includes evaporation and precipitation",
    "different ecosystems support unique plant and animal life",
  ],
};

// Enhanced UserTypings component with responsive design
const UserTypings = ({ userInput = "", words = "", isDarkMode = false }) => {
  useEffect(() => {
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `
      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `;
    document.getElementsByTagName("head")[0].appendChild(style);

    return () => {
      if (document.getElementsByTagName("head")[0].contains(style)) {
        document.getElementsByTagName("head")[0].removeChild(style);
      }
    };
  }, []);

  if (!words) return null;

  const getCharClassName = (isCorrect, isIncorrect) => {
    if (isCorrect) return isDarkMode ? "text-green-300" : "text-green-600";
    if (isIncorrect)
      return "text-red-500 bg-red-100 dark:bg-red-900 dark:bg-opacity-30";
    return isDarkMode ? "text-gray-600" : "text-gray-400";
  };

  // Responsive text sizing based on screen width
  const glowStyle = {
    textShadow: "0 0 8px rgba(59, 130, 246, 0.6)",
    fontWeight: "600",
    fontSize: "clamp(1.5rem, 5vw, 2.5rem)", // Responsive font size
    letterSpacing: "0.05em",
  };

  return (
    <div className="relative w-full">
      <div
        className="tracking-wide font-light text-gray-400 dark:text-gray-600 opacity-0 w-full break-words"
        style={glowStyle}
      >
        {words}
      </div>

      <div
        className="absolute top-0 left-0 w-full break-words"
        style={glowStyle}
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
                textDecoration: isIncorrect ? "underline" : "none",
                textDecorationColor: isIncorrect ? "red" : "transparent",
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
                    zIndex: 10,
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
  const [generatedHistory, setGeneratedHistory] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(
    AGE_GROUPS[ageGroup].initialLevel
  );
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
            role: "system",
            content: `You are generating typing exercises. Follow these rules STRICTLY:
                      1. NEVER repeat any of these sentences: ${JSON.stringify(
                        generatedHistory
                      )}
                      2. ALWAYS return ONLY what's requested (no explanations)
                      3. For multiple items, ALWAYS return valid JSON arrays
                      4. EVERY sentence must be COMPLETELY UNIQUE`,
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      const generatedText = completion.choices[0]?.message?.content;
      if (generatedText) {
        const cleanedText = generatedText
          .replace(/"/g, "")
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        setGeneratedHistory((prev) => [...prev, cleanedText]);
        return cleanedText;
      }
      throw new Error("No text generated");
    } catch (err) {
      console.error("Error generating text with Groq:", err);
      setError(err);
      const fallbacks =
        FALLBACK_TEXTS[ageGroup] || FALLBACK_TEXTS[AGE_GROUPS[ageGroup].initialLevel];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    } finally {
      setIsLoading(false);
    }
  };

  const adjustLevel = (accuracy, wpm) => {
    setPerformanceHistory((prev) => [...prev, { accuracy, wpm }]);

    const avgAccuracy =
      performanceHistory.reduce((sum, item) => sum + item.accuracy, accuracy) /
      (performanceHistory.length + 1);
    const avgWPM =
      performanceHistory.reduce((sum, item) => sum + item.wpm, wpm) /
      (performanceHistory.length + 1);

    let newLevel = currentLevel;

    if (ageGroup === "5-7") {
      if (avgAccuracy > 90 && avgWPM > 10 && currentLevel === 1) {
        newLevel = 2;
      } else if (avgAccuracy < 80 && currentLevel === 2) {
        newLevel = 1;
      }
    } else if (ageGroup === "8-10") {
      if (avgAccuracy > 85 && avgWPM > 20 && currentLevel === 1) {
        newLevel = 2;
      } else if (avgAccuracy < 70 || avgWPM < 15) {
        newLevel = 1;
      }
    } else if (ageGroup === "11-12") {
      if (avgAccuracy > 80 && avgWPM > 30 && currentLevel === 1) {
        // 1 = poems
        newLevel = 2; // to intermediate
      } else if (avgAccuracy > 85 && avgWPM > 35 && currentLevel === 2) {
        newLevel = 3; // to advanced
      } else if ((avgAccuracy < 65 || avgWPM < 20) && currentLevel !== 1) {
        newLevel = currentLevel === 3 ? 2 : 1;
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
  const { getAIText, adjustLevel, currentLevel, isLoading, error } =
    useAITextGenerator(ageGroup);
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
      const fallbacks =
        FALLBACK_TEXTS[ageGroup] || FALLBACK_TEXTS[ageConfig.initialLevel];
      setCurrentWords(fallbacks[0]);
      setNextWords(fallbacks[1]);
    }
  };

  const progressToNextText = async () => {
    setCompletedTexts((prev) => prev + 1);
    setCurrentWords(nextWords);

    try {
      const next = await getAIText(currentLevel);
      setNextWords(next);
    } catch (err) {
      console.error("Error generating next text:", err);
      const fallbacks =
        FALLBACK_TEXTS[ageGroup] || FALLBACK_TEXTS[ageConfig.initialLevel];
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

        if (
          accuracy >
            (ageGroup === "5-7" ? 85 : ageGroup === "8-10" ? 80 : 75) &&
          wpm > (ageGroup === "5-7" ? 10 : ageGroup === "8-10" ? 20 : 30)
        ) {
          setTimeLeft((prev) => Math.max(ageConfig.minTimer, prev - 2));
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

      setTotalTyped((prev) => prev + typed.length);
      setTotalCorrect((prev) => prev + currentCorrect);
      setErrors((prev) => prev + currentErrors);

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
        key === '"' ||
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
    restart,
  };
};

// Start Button Component
const StartButton = ({ onStart }) => {
  return (
    <button
      onClick={onStart}
      className="bg-[#F09000] hover:bg-[#C07000] text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg w-full sm:w-auto"
      style={{
        backgroundColor: "#F09000",
        color: "black",
        boxShadow: "0 4px 14px rgba(240, 144, 0, 0.4)",
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
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </button>
  );
};

// Main Monkey Type Component
const MonkeyTypeComponent = () => {
  const params = useParams();
  const storedAge = localStorage.getItem("userAge");

  // Function to determine age group from actual age
  const getAgeGroup = (age) => {
    if (!age) return "8-10"; // default
    if (age >= 5 && age <= 7) return "5-7";
    if (age >= 8 && age <= 10) return "8-10";
    if (age >= 11 && age <= 12) return "11-12";
    return "8-10"; // default for ages outside our ranges
  };

  const ageGroup = params.ageGroup || getAgeGroup(storedAge) || "8-10";
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
    restart,
  } = useTypingEngine(ageGroup);

  const [isVisible, setIsVisible] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);

  const accuracy = totalTyped > 0 ? (totalCorrect / totalTyped) * 100 : 0;
  const wpm = calculateWPM(
    totalTyped,
    AGE_GROUPS[ageGroup].initialTimer - timeLeft
  );

  useEffect(() => setIsVisible(true), []);

  useEffect(() => {
    if (state === "finish") {
      saveProgress();
    }
  }, [state]);

  const saveProgress = async () => {
    try {
      const progressData = {
        gameType: "monkey",
        completionTime: wpm,
        accuracy: accuracy,
        level: currentLevel,
        ageGroup: ageGroup,
        date: new Date().toISOString(),
        wpm: wpm,
        monkeyAccuracy: accuracy,
      };

      console.log("Saving monkey game progress:", progressData);
      const response = await progressService.saveGameProgress(progressData);
      console.log("Monkey game progress saved:", response);

      setSavedProgress(true);
    } catch (error) {
      console.error("Error saving monkey game progress:", error);
    }
  };

  const restartGame = () => {
    setSavedProgress(false);
    restart();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center px-4 py-6 sm:py-10"
      style={{ paddingTop: "calc(36px + 1.5rem)" }}
    >
      <div
        className={`bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-xl max-w-2xl w-full transform transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
        style={{
          boxShadow: "0 10px 25px rgba(0,122,255,0.1)",
          border: "1px solid rgba(0,0,0,0.05)",
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

        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 sm:mb-3 dark:text-white text-black">
            {ageGroup === "5-7"
              ? "Fun Typing for Kids"
              : ageGroup === "8-10"
              ? "Tappy Type"
              : "Advanced Typing Challenge"}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 px-2 sm:px-4 text-sm sm:text-base">
            {ageGroup === "5-7"
              ? "Type the letters and words as they appear. Let's learn together!"
              : ageGroup === "8-10"
              ? "Type the words below as quickly and accurately as you can."
              : "Challenge yourself with complex texts. Accuracy and speed both matter!"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl">
          <div className="flex items-center space-x-2 mb-3 sm:mb-0">
            <div
              className="relative h-10 w-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor:
                  timeLeft > AGE_GROUPS[ageGroup].initialTimer / 2
                    ? "#34C759"
                    : timeLeft > AGE_GROUPS[ageGroup].initialTimer / 4
                    ? "#FF9500"
                    : "#FF3B30",
                boxShadow: `0 0 10px ${
                  timeLeft > AGE_GROUPS[ageGroup].initialTimer / 2
                    ? "#34C759"
                    : timeLeft > AGE_GROUPS[ageGroup].initialTimer / 4
                    ? "#FF9500"
                    : "#FF3B30"
                }`,
              }}
            >
              <span className="text-white font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
            <span className="text-lg font-medium dark:text-white">
              time left
            </span>
          </div>

          {state === "start" && (
            <div className="flex space-x-3 sm:space-x-5 flex-wrap justify-center">
              <div className="text-center px-2">
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  WPM
                </div>
                <div className="text-base sm:text-lg font-bold text-blue-500">
                  {wpm}
                </div>
              </div>
              <div className="text-center px-2">
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Accuracy
                </div>
                <div
                  className="text-base sm:text-lg font-bold"
                  style={{
                    color:
                      accuracy > 90
                        ? "#34C759"
                        : accuracy > 70
                        ? "#FF9500"
                        : "#FF3B30",
                  }}
                >
                  {accuracy.toFixed(0)}%
                </div>
              </div>
              <div className="text-center px-2">
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Level
                </div>
                <div className="text-base sm:text-lg font-bold text-indigo-500">
                  {currentLevel}
                </div>
              </div>
            </div>
          )}

          {state === "finish" && (
            <div className="w-full sm:w-auto flex justify-center">
              <RestartButton onRestart={restartGame} />
            </div>
          )}
        </div>

        {avatarMessage && (
          <div className="mb-4 flex justify-center">
            <Avatar ageGroup={ageGroup} message={avatarMessage} />
          </div>
        )}

        <div
          className="relative p-4 sm:p-8 rounded-xl mb-4 sm:mb-6"
          style={{
            boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
            marginBottom: "1rem sm:2rem",
            minHeight: "120px sm:160px",
          }}
        >
          {state === "idle" ? (
            <div className="flex flex-col items-center justify-center h-32 sm:h-40">
              <p className="text-gray-500 mb-4 sm:mb-6 text-center text-sm sm:text-base">
                {ageGroup === "5-7"
                  ? "Ready to learn typing with fun?"
                  : "Ready to test your typing skills?"}
              </p>
              <StartButton onStart={startGame} />
            </div>
          ) : (
            <>
              <div className="mt-4 sm:mt-8 w-full overflow-x-hidden">
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
          <div className="border-l-4 border-gray-300 pl-3 sm:pl-4 mb-4 sm:mb-6 mt-2 sm:mt-3 text-sm">
            <p className="text-xs sm:text-sm italic text-gray-500 dark:text-gray-400">
              Coming next:
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
              {nextWords.length > 30
                ? nextWords.substring(0, 30) + "..."
                : nextWords}
            </p>
          </div>
        )}

        <Results
          state={state}
          className="mt-6 sm:mt-8"
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