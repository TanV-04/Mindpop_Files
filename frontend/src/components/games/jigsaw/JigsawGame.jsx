//frontend\src\components\games\jigsaw\JigsawGame.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { JigsawPuzzle } from "react-jigsaw-puzzle/lib";
import "react-jigsaw-puzzle/lib/jigsaw-puzzle.css";
import { progressService } from "../../../utils/apiService";
import Confetti from "./Confetti";
import "./JigsawGame.css";
// Import images for all age groups
const imageModules6to8 = import.meta.glob(
  "/src/assets/images_for_jigsaw_6_to_8/*.{png,jpg,jpeg,svg,webp}",
  { eager: true }
);
const imageModules8to10 = import.meta.glob(
  "/src/assets/images_for_jigsaw_8_to_10/*.{png,jpg,jpeg,svg,webp}",
  { eager: true }
);
const imageModules10to12 = import.meta.glob(
  "/src/assets/images_for_jigsaw_10_to_12/*.{png,jpg,jpeg,svg,webp}",
  { eager: true }
);
const imageModules12to14 = import.meta.glob(
  "/src/assets/images_for_jigsaw_12_to_14/*.{png,jpg,jpeg,svg,webp}",
  { eager: true }
);

// Organize images by age group
const IMAGE_SETS = {
  "6-8": Object.values(imageModules6to8).map((mod) => mod.default),
  "8-10": Object.values(imageModules8to10).map((mod) => mod.default),
  "10-12": Object.values(imageModules10to12).map((mod) => mod.default),
  "12-14": Object.values(imageModules12to14).map((mod) => mod.default),
};

// Encouraging messages
const affirmations = [
  "Great job! 👏",
  "You're doing amazing! 🌟",
  "Keep going! 🚀",
  "Nice move! 👍",
  "Fantastic! 💖",
  "You're a puzzle pro! 🧩",
  "Excellent! ✨",
  "Brilliant! 🎯",
  "Super work! 💪",
];

// Age group configurations
const AGE_GROUP_CONFIG = {
  "6-8": {
    levels: [
      { name: "Easy", rows: 2, columns: 2, emoji: "😊" },
      { name: "Medium", rows: 3, columns: 3, emoji: "🤓" },
    ],
    defaultLevel: 0,
  },
  "8-10": {
    levels: [
      { name: "Easy", rows: 3, columns: 3, emoji: "😊" },
      { name: "Medium", rows: 4, columns: 4, emoji: "🤓" },
      { name: "Hard", rows: 5, columns: 5, emoji: "🏆" },
    ],
    defaultLevel: 1,
  },
  "10-12": {
    levels: [
      { name: "Easy", rows: 4, columns: 4, emoji: "😊" },
      { name: "Medium", rows: 5, columns: 5, emoji: "🤓" },
      { name: "Hard", rows: 6, columns: 6, emoji: "🏆" },
    ],
    defaultLevel: 1,
  },
  "12-14": {
    levels: [
      { name: "Easy", rows: 5, columns: 5, emoji: "🤓" },
      { name: "Medium", rows: 6, columns: 6, emoji: "🏆" },
      { name: "Hard", rows: 7, columns: 7, emoji: "🎖️" },
    ],
    defaultLevel: 1,
  },
};

const JigsawGame = () => {
  const navigate = useNavigate();
  
  // Get user age from localStorage
  const getAgeGroup = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const age = user.age || 9;
    
    if (age >= 6 && age <= 8) return "6-8";
    if (age >= 9 && age <= 10) return "8-10";
    if (age >= 11 && age <= 12) return "10-12";
    if (age >= 13 && age <= 14) return "12-14";
    return "8-10"; // default
  };

  const ageGroup = getAgeGroup();
  const config = AGE_GROUP_CONFIG[ageGroup];
  const images = IMAGE_SETS[ageGroup];

  // State
  const [screen, setScreen] = useState("levelSelect"); // levelSelect, loading, playing, completed
  const [selectedLevel, setSelectedLevel] = useState(config.defaultLevel);
  const [selectedImage, setSelectedImage] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [correctPieces, setCorrectPieces] = useState(0);
  const [totalPieces, setTotalPieces] = useState(0);
  const [showAffirmation, setShowAffirmation] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const timerRef = useRef(null);

  const currentLevel = config.levels[selectedLevel];

  // Start game with selected level
  const startGame = (levelIndex) => {
    setScreen("loading");
    setSelectedLevel(levelIndex);
    const level = config.levels[levelIndex];
    
    // Select random image
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setSelectedImage(randomImage);

    // Preload image
    const img = new Image();
    img.src = randomImage;
    img.onload = () => {
      setTotalPieces(level.rows * level.columns);
      setCorrectPieces(0);
      setShowPreview(false);
      setShowConfetti(false);
      
      // Start timer
      const now = Date.now();
      setStartTime(now);
      setElapsedTime(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - now) / 1000));
      }, 1000);

      setScreen("playing");
    };
  };

  // Handle puzzle completion
  const handleSolved = async () => {
    const now = Date.now();
    setEndTime(now);
    setCorrectPieces(totalPieces);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    setShowConfetti(true);
    
    // Save progress
    try {
      const completionTime = Math.round((now - startTime) / 1000);
      await progressService.saveGameProgress({
        gameType: "jigsaw",
        completionTime,
        accuracy: 100,
        level: selectedLevel + 1,
        ageGroup,
        puzzleSize: `${currentLevel.rows}x${currentLevel.columns}`,
        totalPieces,
      });
      console.log("Jigsaw progress saved!");
    } catch (error) {
      console.error("Error saving progress:", error);
    }

    setTimeout(() => {
      setScreen("completed");
      setShowConfetti(false);
    }, 3000);
  };

  // Show random affirmation
  const showRandomAffirmation = () => {
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];
    setShowAffirmation(random);
    setTimeout(() => setShowAffirmation(""), 1500);
  };

  // Track correct pieces
  useEffect(() => {
    if (screen !== "playing") return;

    const puzzleContainer = document.querySelector(".jigsaw-puzzle");
    if (!puzzleContainer) return;

    const observer = new MutationObserver(() => {
      const solvedPieces = puzzleContainer.querySelectorAll(
        ".jigsaw-puzzle__piece--solved"
      ).length;

      if (solvedPieces > correctPieces) {
        setCorrectPieces(solvedPieces);
        showRandomAffirmation();
      }
    });

    observer.observe(puzzleContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [screen, correctPieces]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Reset game
  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen("levelSelect");
    setCorrectPieces(0);
    setShowPreview(false);
    setShowConfetti(false);
  };

  return (
    <div className="jigsaw-game-container">
      <Confetti active={showConfetti} />

      {/* Level Selection Screen */}
      {screen === "levelSelect" && (
        <div className="jigsaw-screen">
          <div className="jigsaw-content">
            <button 
              className="back-button-jigsaw"
              onClick={() => navigate("/games")}
            >
              ← Back to Games
            </button>
            
            <h1 className="jigsaw-title">🧩 Puzzle Time! 🧩</h1>
            <p className="jigsaw-subtitle">Choose your challenge level</p>
            <p className="age-group-badge">Age Group: {ageGroup} years</p>

            <div className="level-buttons">
              {config.levels.map((level, index) => (
                <button
                  key={index}
                  className="level-button"
                  onClick={() => startGame(index)}
                >
                  <span className="level-emoji">{level.emoji}</span>
                  <span className="level-name">{level.name}</span>
                  <span className="level-size">{level.rows}×{level.columns} pieces</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {screen === "loading" && (
        <div className="jigsaw-screen">
          <div className="jigsaw-content">
            <div className="loading-spinner"></div>
            <h2 className="loading-text">Creating your puzzle...</h2>
          </div>
        </div>
      )}

      {/* Playing Screen */}
      {screen === "playing" && (
        <div className="jigsaw-screen">
          <div className="jigsaw-content playing">
            {/* Stats Bar */}
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-label">Level:</span>
                <span className="stat-value">{currentLevel.name} {currentLevel.emoji}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">⏱️</span>
                <span className="stat-value">{formatTime(elapsedTime)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Progress:</span>
                <span className="stat-value">{correctPieces}/{totalPieces}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${(correctPieces / totalPieces) * 100}%` }}
              ></div>
            </div>

            {/* Affirmation */}
            {showAffirmation && (
              <div className="affirmation">{showAffirmation}</div>
            )}

            {/* Puzzle Container */}
            <div className="puzzle-wrapper">
              <div className="puzzle-container">
                <JigsawPuzzle
                  imageSrc={selectedImage}
                  rows={currentLevel.rows}
                  columns={currentLevel.columns}
                  onSolved={handleSolved}
                  className="jigsaw-puzzle"
                />
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="preview-box">
                  <img src={selectedImage} alt="Preview" />
                  <div className="preview-label">Preview</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="action-btn preview-btn"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Hide Preview 👁️" : "Show Preview 👁️"}
              </button>
              <button
                className="action-btn restart-btn"
                onClick={resetGame}
              >
                Restart 🔄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Screen */}
      {screen === "completed" && (
        <div className="jigsaw-screen">
          <div className="jigsaw-content">
            <div className="completion-card">
              <div className="trophy-icon">🏆</div>
              <h1 className="completion-title">Amazing! You Did It! 🎉</h1>
              <p className="completion-time">
                Completed in <strong>{formatTime(Math.round((endTime - startTime) / 1000))}</strong>
              </p>
              <p className="completion-level">
                Level: <strong>{currentLevel.name}</strong> ({currentLevel.rows}×{currentLevel.columns} pieces)
              </p>

              <div className="completion-buttons">
                <button
                  className="completion-btn same-level-btn"
                  onClick={() => startGame(selectedLevel)}
                >
                  Play Again 🔄
                </button>
                <button
                  className="completion-btn choose-level-btn"
                  onClick={resetGame}
                >
                  Choose Level 🧩
                </button>
                <button
                  className="completion-btn back-btn"
                  onClick={() => navigate("/games")}
                >
                  Back to Games 🎮
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JigsawGame;