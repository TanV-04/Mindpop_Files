import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RestartButton from "../../RestartButton";
import Results from "./Results";
import Avatar from "./Avatar";
import { 
  UserTypings, 
  useTypingEngine, 
  StartButton 
} from "./MonkeyTypeUtils";

const AGE_CONFIG = {
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
};

const MonkeyType8to10 = () => {
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
  } = useTypingEngine("8-10", AGE_CONFIG);
  
  const [isVisible, setIsVisible] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  
  const accuracy = totalTyped > 0 ? (totalCorrect / totalTyped) * 100 : 0;
  const wpm = calculateWPM(totalTyped, AGE_CONFIG.initialTimer - timeLeft);
  
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
        ageGroup: "8-10",
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
            Tappy Type
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 px-4">
            Type the words below as quickly and accurately as you can.
          </p>
        </div>

        <div className="flex justify-between items-center mb-6 p-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <div
              className="relative h-10 w-10 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: timeLeft > AGE_CONFIG.initialTimer/2 ? '#34C759' : 
                                timeLeft > AGE_CONFIG.initialTimer/4 ? '#FF9500' : '#FF3B30',
                boxShadow: `0 0 10px ${timeLeft > AGE_CONFIG.initialTimer/2 ? '#34C759' : 
                            timeLeft > AGE_CONFIG.initialTimer/4 ? '#FF9500' : '#FF3B30'}`
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
            <Avatar ageGroup="8-10" message={avatarMessage} />
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
                Ready to test your typing skills?
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
          totalTypingTime={AGE_CONFIG.initialTimer}
          ageGroup="8-10"
        />
      </div>
    </div>
  );
};

export default MonkeyType8to10;