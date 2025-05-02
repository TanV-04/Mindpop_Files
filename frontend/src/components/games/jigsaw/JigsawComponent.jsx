import React, { useState, useEffect, useRef } from "react";
import { JigsawPuzzle } from "react-jigsaw-puzzle/lib";
import "react-jigsaw-puzzle/lib/jigsaw-puzzle.css";
import "./jigsaw.css";
import { progressService } from "../../../utils/apiService";

// Import all image assets
const imageModules6to8 = import.meta.glob(
  "/src/assets/images_for_jigsaw_6_to_8/*.{png,jpg,jpeg,svg}",
  { eager: true }
);
const imageModules8to10 = import.meta.glob(
  "/src/assets/images_for_jigsaw_8_to_10/*.{png,jpg,jpeg,svg}",
  { eager: true }
);
const imageModules10to12 = import.meta.glob(
  "/src/assets/images_for_jigsaw_10_to_12/*.{png,jpg,jpeg,svg}",
  { eager: true }
);
const imageModules12to14 = import.meta.glob(
  "/src/assets/images_for_jigsaw_12_to_14/*.{png,jpg,jpeg,svg}",
  { eager: true }
);

// Combine all images by age group
const IMAGE_SETS = {
  "6-8": Object.values(imageModules6to8).map((mod) => mod.default),
  "8-10": Object.values(imageModules8to10).map((mod) => mod.default),
  "10-12": Object.values(imageModules10to12).map((mod) => mod.default),
  "12-14": Object.values(imageModules12to14).map((mod) => mod.default),
};

const affirmations = [
  "Great job! 👏🏼",
  "You're doing amazing! 😁",
  "Keep going! 🚀",
  "Nice move! 👍🏼",
  "Fantastic! 💖",
  "You're a puzzle pro! 😎",
  "That's the way! 😲",
  "Excellent! 🌟",
  "Brilliant! 🫡",
  "Super work! 👌",
];

// Age group configurations
const AGE_GROUPS = {
  "6-8": {
    difficultyLevels: [
      { name: "1", rows: 2, columns: 2, emoji: "😊" },
      { name: "2", rows: 3, columns: 3, emoji: "🤓" },
    ],
    initialDifficulty: { name: "1", rows: 2, columns: 2, emoji: "😊" },
    theme: {
      bgGradient: "from-yellow-100 to-blue-100",
      textColor: "text-blue-700",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      restartColor: "bg-orange-500 hover:bg-orange-600",
      cardBg: "#F9F0D0",
      borderColor: "#66220B",
    },
  },
  "8-10": {
    difficultyLevels: [
      { name: "1", rows: 3, columns: 3, emoji: "🙂" },
      { name: "2", rows: 4, columns: 4, emoji: "😊" },
      { name: "3", rows: 5, columns: 5, emoji: "🤓" },
    ],
    initialDifficulty: { name: "2", rows: 4, columns: 4, emoji: "😊" },
    theme: {
      bgGradient: "from-orange-50 via-amber-50 to-yellow-50",
      textColor: "text-[#66220B]",
      buttonColor: "bg-[#F09000] hover:bg-[#C07000]",
      cardBg: "#F9F0D0",
      borderColor: "#66220B",
    },
  },
  "10-12": {
    difficultyLevels: [
      { name: "1", rows: 4, columns: 4, emoji: "😊" },
      { name: "2", rows: 5, columns: 5, emoji: "🤓" },
      { name: "3", rows: 6, columns: 6, emoji: "🧠" },
    ],
    initialDifficulty: { name: "2", rows: 5, columns: 5, emoji: "🤓" },
    theme: {
      bgGradient: "from-yellow-100 to-blue-100",
      textColor: "text-blue-700",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      restartColor: "bg-orange-500 hover:bg-orange-600",
      cardBg: "#F9F0D0",
      borderColor: "#66220B",
    },
  },
  "12-14": {
    difficultyLevels: [
      { name: "1", rows: 5, columns: 5, emoji: "🤓" },
      { name: "2", rows: 6, columns: 6, emoji: "🧠" },
      { name: "3", rows: 7, columns: 7, emoji: "🏆" },
    ],
    initialDifficulty: { name: "2", rows: 6, columns: 6, emoji: "🧠" },
    theme: {
      bgGradient: "from-yellow-100 to-blue-100",
      textColor: "text-blue-700",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      restartColor: "bg-orange-500 hover:bg-orange-600",
      cardBg: "#F9F0D0",
      borderColor: "#66220B",
    },
  },
};

const JigsawComponent = () => {
  // Get age from localStorage and determine age group
  const storedAge = localStorage.getItem("userAge");
  const getAgeGroup = (age) => {
    if (!age) return "8-10"; // default
    if (age >= 6 && age <= 8) return "6-8";
    if (age >= 9 && age <= 10) return "8-10";
    if (age >= 11 && age <= 12) return "10-12";
    if (age >= 13 && age <= 14) return "12-14";
    return "8-10"; // default for ages outside our ranges
  };
  
  const ageGroup = getAgeGroup(storedAge);
  const ageConfig = AGE_GROUPS[ageGroup];
  const images = IMAGE_SETS[ageGroup];

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [message, setMessage] = useState("Select a difficulty level to begin!");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [solved, setSolved] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAffirmation, setShowAffirmation] = useState("");
  const [correctPieces, setCorrectPieces] = useState(0);
  const [difficulty, setDifficulty] = useState(ageConfig.initialDifficulty);
  const [totalPieces, setTotalPieces] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);

  const timerRef = useRef(null);

  const handleSelectDifficulty = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setShowDifficultySelector(false);
    handleStartGame(selectedDifficulty);
  };

  const handleStartGame = (selectedDiff = difficulty) => {
    setLoading(true);
    setGameStarted(false);
    setMessage("Loading puzzle...");
    setCorrectPieces(0);
    setSolved(false);
    setShowPreview(false);
    setSavedProgress(false);

    const randomImage = images[Math.floor(Math.random() * images.length)];
    setSelectedImage(randomImage);

    const img = new window.Image();
    img.src = randomImage;
    img.onload = () => {
      setImageLoaded(true);
      setTotalPieces(selectedDiff.rows * selectedDiff.columns);
      setGameStarted(true);
      setLoading(false);
      setMessage("Drag pieces to complete the puzzle!");

      const now = Date.now();
      setStartTime(now);
      setElapsedTime(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - now) / 1000));
      }, 1000);
    };
  };

  const handleSolved = () => {
    const now = Date.now();
    setEndTime(now);
    setSolved(true);
    setCorrectPieces(totalPieces);
    setMessage("🎉 Puzzle completed! Great work!");
    if (timerRef.current) clearInterval(timerRef.current);
    saveProgress(now);
  };

  const saveProgress = async (endTimeStamp) => {
    try {
      const completionTime = Math.round((endTimeStamp - startTime) / 1000);
      const progressData = {
        gameType: 'jigsaw',
        completionTime: completionTime,
        accuracy: 100, // Jigsaw puzzles are always 100% accurate when completed
        level: difficulty.name,
        ageGroup: ageGroup,
        date: new Date().toISOString(),
        puzzleSize: `${difficulty.rows}x${difficulty.columns}`,
        totalPieces: totalPieces
      };
      
      console.log('Saving jigsaw game progress:', progressData);
      const response = await progressService.saveGameProgress(progressData);
      console.log('Jigsaw game progress saved:', response);
      
      setSavedProgress(true);
    } catch (error) {
      console.error('Error saving jigsaw game progress:', error);
    }
  };

  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameStarted(false);
    setImageLoaded(false);
    setSolved(false);
    setMessage("Select a difficulty level to begin!");
    setElapsedTime(0);
    setCorrectPieces(0);
    setShowDifficultySelector(true);
  };

  const confirmOrRestart = () => {
    if (gameStarted && !solved) {
      const confirm = window.confirm(
        "Are you sure you want to restart the puzzle?"
      );
      if (confirm) handleRestart();
    } else {
      handleRestart();
    }
  };

  const showRandomAffirmation = () => {
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];
    setShowAffirmation(random);
    setTimeout(() => setShowAffirmation(""), 1500);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!gameStarted || !imageLoaded) return;

    const puzzleContainer = document.querySelector(".jigsaw-puzzle");
    if (!puzzleContainer) return;

    const observer = new MutationObserver(() => {
      if (!solved) {
        const solvedPieces = puzzleContainer.querySelectorAll(
          ".jigsaw-puzzle__piece--solved"
        ).length;

        if (solvedPieces > correctPieces) {
          setCorrectPieces(solvedPieces);
          showRandomAffirmation();
        }
      }
    });

    observer.observe(puzzleContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [gameStarted, imageLoaded, correctPieces, solved]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br ${ageConfig.theme.bgGradient} p-4`} style={{ backgroundColor: ageConfig.theme.cardBg }}>
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl p-8 mb-8 border-4" style={{ borderColor: ageConfig.theme.borderColor, backgroundColor: ageConfig.theme.cardBg }}>
        <h1 className="text-4xl font-bold text-center mb-2" style={{ color: ageConfig.theme.borderColor }}>
          ✨ Puzzle Fun Time ✨
        </h1>
        <p className="text-center mb-8" style={{ color: ageConfig.theme.borderColor }}>Challenge your mind with our beautiful puzzles</p>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-md relative">
            {showDifficultySelector && !loading && (
              <div className="p-8 rounded-2xl shadow-md mb-6 border-2 text-center" style={{ backgroundColor: ageConfig.theme.cardBg, borderColor: "#F09000" }}>
                <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: ageConfig.theme.borderColor }}>
                  Choose Your Difficulty 🧩
                </h2>
                
                <div className="flex flex-col gap-4">
                  {ageConfig.difficultyLevels.map((level) => (
                    <button
                      key={level.name}
                      onClick={() => handleSelectDifficulty(level)}
                      className="w-full text-white font-semibold py-4 px-6 rounded-xl shadow-md transform transition duration-300 hover:shadow-lg hover:scale-105 text-lg flex items-center justify-center"
                      style={{ backgroundColor: "#F09000" }}
                    >
                      <span className="mr-2">Level {level.name}</span>
                      <span>{level.emoji}</span>
                      <span className="ml-4 text-sm font-normal">({level.rows}x{level.columns})</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 p-4 rounded-lg bg-white bg-opacity-50 border border-dashed" style={{ borderColor: ageConfig.theme.borderColor }}>
                  <p className="text-sm" style={{ color: ageConfig.theme.borderColor }}>
                    Select easier levels for fewer pieces, or challenge yourself with more difficult levels!
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="rounded-2xl p-12 text-center shadow-md border-2" style={{ backgroundColor: ageConfig.theme.cardBg, borderColor: "#F09000" }}>
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute top-0 w-full h-full rounded-full border-4 animate-spin" style={{ borderTopColor: "#F09000", borderRightColor: ageConfig.theme.borderColor, borderBottomColor: "#F09000", borderLeftColor: "transparent" }}></div>
                  <div className="absolute top-2 left-2 w-16 h-16 rounded-full border-4 animate-spin" style={{ borderTopColor: "transparent", borderRightColor: "transparent", borderBottomColor: "transparent", borderLeftColor: ageConfig.theme.borderColor }}></div>
                </div>
                <p className="text-xl" style={{ color: ageConfig.theme.borderColor }}>Creating your puzzle magic...</p>
              </div>
            )}

            {gameStarted && (
              <div className="relative">
                <div className="rounded-2xl shadow-md p-5 mb-6 border-2" style={{ backgroundColor: ageConfig.theme.cardBg, borderColor: "#F09000" }}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-md py-2 px-4 rounded-full" style={{ backgroundColor: ageConfig.theme.cardBg, border: `2px solid ${ageConfig.theme.borderColor}` }}>
                      <span className="font-medium mr-1" style={{ color: ageConfig.theme.borderColor }}>Level:</span>
                      <span className="font-bold" style={{ color: "#F09000" }}>{difficulty.name}</span>
                      <span className="ml-2">{difficulty.emoji}</span>
                    </div>
                    <div className="flex items-center text-md py-2 px-4 rounded-full" style={{ backgroundColor: ageConfig.theme.cardBg, border: `2px solid ${ageConfig.theme.borderColor}` }}>
                      <span className="font-medium mr-2" style={{ color: ageConfig.theme.borderColor }}>⏱️</span>
                      <span className="font-bold" style={{ color: "#F09000" }}>{formatTime(elapsedTime)}</span>
                    </div>
                  </div>

                  <div className="w-full rounded-full h-3 mb-2 overflow-hidden" style={{ backgroundColor: ageConfig.theme.borderColor, opacity: "0.2" }}>
                    <div
                      className="h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        backgroundColor: "#F09000", 
                        width: `${(correctPieces / totalPieces) * 100}%` 
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium" style={{ color: ageConfig.theme.borderColor }}>{correctPieces} of {totalPieces} pieces</span>
                    <span className="font-medium" style={{ color: ageConfig.theme.borderColor }}>{Math.round((correctPieces / totalPieces) * 100)}% complete</span>
                  </div>
                </div>

                <div
                  className={`absolute left-1/2 transform -translate-x-1/2 z-20 text-lg font-bold px-6 py-3 rounded-full transition-all duration-500 ${
                    showAffirmation
                      ? "opacity-100 -top-14 text-white shadow-lg"
                      : "opacity-0 -top-8"
                  }`}
                  style={{ backgroundColor: showAffirmation ? "#F09000" : "transparent" }}
                >
                  {showAffirmation}
                </div>

                <div className="relative puzzle-container mb-6">
                  <div className="p-6 rounded-2xl border-2" style={{ backgroundColor: ageConfig.theme.cardBg, borderColor: ageConfig.theme.borderColor }}>
                    <JigsawPuzzle
                      imageSrc={selectedImage}
                      rows={difficulty.rows}
                      columns={difficulty.columns}
                      onSolved={handleSolved}
                      className="jigsaw-puzzle"
                    />
                  </div>

                  {showPreview && (
                    <div className="absolute top-8 right-8 w-36 h-36 border-4 rounded-lg shadow-lg overflow-hidden z-20" style={{ borderColor: ageConfig.theme.cardBg }}>
                      <img
                        src={selectedImage}
                        alt="Puzzle preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 text-white text-xs py-1 text-center" style={{ backgroundColor: `rgba(102, 34, 11, 0.7)` }}>
                        Preview
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {gameStarted && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={togglePreview}
                className={`font-medium py-3 px-6 rounded-full transition shadow-md flex items-center`}
                style={{ 
                  backgroundColor: showPreview ? ageConfig.theme.borderColor : ageConfig.theme.cardBg, 
                  color: showPreview ? ageConfig.theme.cardBg : ageConfig.theme.borderColor,
                  border: `2px solid ${ageConfig.theme.borderColor}`
                }}
              >
                {showPreview ? "Hide Preview 👁️" : "Show Preview 👁️"}
              </button>

              <button
                onClick={confirmOrRestart}
                className="text-white font-medium py-3 px-6 rounded-full transition shadow-md flex items-center"
                style={{ backgroundColor: "#F09000" }}
              >
                {solved ? "New Puzzle 🎮" : "Restart 🔄"}
              </button>
            </div>
          )}

          {solved && (
            <div className="mt-8 border-3 rounded-2xl p-8 text-center max-w-md animate-fade-in shadow-lg" style={{ backgroundColor: ageConfig.theme.cardBg, borderColor: "#F09000" }}>
              <div className="inline-block p-3 rounded-full mb-4" style={{ backgroundColor: "#F09000", opacity: "0.3" }}>
                <span className="text-4xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: ageConfig.theme.borderColor }}>
                Woohoo! You Did It! 🎉
              </h3>
              <p className="mb-5" style={{ color: ageConfig.theme.borderColor }}>
                Amazing job! You completed the puzzle in{" "}
                <strong style={{ color: "#F09000" }}>{formatTime(Math.round((endTime - startTime) / 1000))}</strong>
              </p>
              {savedProgress && (
                <p className="text-green-600 mb-5">
                  Your progress has been saved!
                </p>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="text-white font-semibold py-3 px-8 rounded-xl shadow-md transition hover:shadow-lg text-lg"
                  style={{ backgroundColor: "#F09000" }}
                >
                  Choose Level 🎮
                </button>
                <button
                  onClick={() => handleStartGame(difficulty)}
                  className="font-semibold py-3 px-8 rounded-xl shadow-md transition hover:shadow-lg text-lg border-2"
                  style={{ color: ageConfig.theme.borderColor, borderColor: "#F09000" }}
                >
                  Same Level 🔄
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JigsawComponent;