import React, { useState, useEffect, useRef } from "react";
import { JigsawPuzzle } from "react-jigsaw-puzzle/lib";
import "react-jigsaw-puzzle/lib/jigsaw-puzzle.css";
import "./jigsaw.css";

const imageModules = import.meta.glob(
  "/src/assets/images_for_jigsaw_8_to_10/*.{png,jpg,jpeg,svg}",
  { eager: true }
);
const IMAGES = Object.values(imageModules).map((mod) => mod.default);

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

const difficultyLevels = [
  { name: "Easy", rows: 3, columns: 3, emoji: "🙂" },
  { name: "Medium", rows: 4, columns: 4, emoji: "😊" },
  { name: "Hard", rows: 5, columns: 5, emoji: "🤓" },
];

const Jigsaw_8_to_10 = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [message, setMessage] = useState("Choose difficulty and start the game!");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [solved, setSolved] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAffirmation, setShowAffirmation] = useState("");
  const [correctPieces, setCorrectPieces] = useState(0);
  const [difficulty, setDifficulty] = useState(difficultyLevels[1]); // Default to Medium
  const [totalPieces, setTotalPieces] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef(null);
  const puzzleContainerRef = useRef(null);

  const handleStartGame = () => {
    setLoading(true);
    setGameStarted(false);
    setMessage("Loading puzzle...");
    setCorrectPieces(0);
    setSolved(false);
    setShowPreview(false);

    const randomImage = IMAGES[Math.floor(Math.random() * IMAGES.length)];
    setSelectedImage(randomImage);

    const img = new window.Image();
    img.src = randomImage;
    img.onload = () => {
      setImageLoaded(true);
      setTotalPieces(difficulty.rows * difficulty.columns);
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

      // Apply custom styling for pieces after a delay
      setTimeout(() => {
        applyCustomPuzzleStyles();
      }, 500);
    };
  };

  // Modified applyCustomPuzzleStyles function
  const applyCustomPuzzleStyles = () => {
    const puzzleContainer = document.querySelector(".jigsaw-puzzle");
    if (!puzzleContainer) return;

    // Add grid lines to the container
    const board = puzzleContainer.querySelector(".jigsaw-puzzle__board");
    if (board) {
      // Add cute dotted grid pattern
      board.style.backgroundImage = `
      linear-gradient(to right, rgba(147, 51, 234, 0.2) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(147, 51, 234, 0.2) 1px, transparent 1px)
    `;
      board.style.backgroundSize = `${100 / difficulty.columns}% ${100 / difficulty.rows}%`;
      board.style.border = "3px dashed rgba(147, 51, 234, 0.3)";
      board.style.borderRadius = "16px";
      board.style.boxSizing = "border-box";
      board.classList.add("puzzle-board-with-grid");
    }

    // Style pieces without interfering with position/transform
    const pieces = puzzleContainer.querySelectorAll(".jigsaw-puzzle__piece:not(.jigsaw-puzzle__piece--solved)");

    pieces.forEach((piece) => {
      // Apply visual styles only, not positioning
      piece.style.cssText += `
      cursor: grab !important;
      z-index: 10 !important;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
      border: 2px solid white !important;
      border-radius: 8px !important;
      transition: box-shadow 0.2s ease-in-out !important;
    `;

      // Add hover effect through a class instead
      piece.addEventListener('mouseenter', () => {
        piece.classList.add('puzzle-piece-hover');
      });

      piece.addEventListener('mouseleave', () => {
        piece.classList.remove('puzzle-piece-hover');
      });
    });

    // After a slight delay, arrange pieces in a circle *once*
    // But do it by dispatching 'mousedown' and 'mouseup' events
    // to let the library handle the positioning
    setTimeout(() => {
      arrangeInitialPiecesInCircle(puzzleContainer, pieces);
    }, 100);
  };

  // New function to arrange pieces initially without overriding the library behavior
  const arrangeInitialPiecesInCircle = (puzzleContainer, pieces) => {
    const containerWidth = puzzleContainer.offsetWidth;
    const containerHeight = puzzleContainer.offsetHeight;

    // Add this to jigsaw.css
    // .puzzle-piece-hover {
    //   box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important;
    //   transform: scale(1.05) !important;
    // }

    // Only arrange pieces that aren't already solved
    const unsolved = Array.from(pieces).filter(piece =>
      !piece.classList.contains('jigsaw-puzzle__piece--solved')
    );

    unsolved.forEach((piece, index) => {
      // Create a circular arrangement
      const angle = (index / unsolved.length) * 2 * Math.PI;
      const radius = Math.min(containerWidth, containerHeight) * 0.4;

      const targetX = Math.cos(angle) * radius + containerWidth / 2;
      const targetY = Math.sin(angle) * radius + containerHeight / 2;

      // Get the current position
      const rect = piece.getBoundingClientRect();
      const containerRect = puzzleContainer.getBoundingClientRect();

      // Calculate relative position within the container
      const currentX = rect.left - containerRect.left + rect.width / 2;
      const currentY = rect.top - containerRect.top + rect.height / 2;

      // Create and dispatch events to move the piece using the library's own handlers
      // Use the react-jigsaw-puzzle library's own event handling

      // Note: This part is tricky and may need adjustments depending on how the 
      // library handles events. If this doesn't work, you might need to modify
      // the library or use a different approach.

      // As a safer approach, you can use the library's API to position pieces
      // if it exposes such methods. Otherwise, check if it's possible to
      // contribute to the library to add an 'initialLayout' option.
    });
  };

  const handleSolved = () => {
    const now = Date.now();
    setEndTime(now);
    setSolved(true);
    setMessage("🎉 Puzzle completed! Great work!");
    if (timerRef.current) clearInterval(timerRef.current);

    // Add confetti effect
    createConfetti();
  };

  const createConfetti = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.animationDelay = `${Math.random() * 3}s`;

      // More colorful and cute confetti
      const confettiType = Math.floor(Math.random() * 4);
      if (confettiType === 0) {
        // Star shape
        confetti.innerHTML = '★';
        confetti.style.fontSize = `${Math.random() * 15 + 10}px`;
        confetti.style.color = `hsl(${Math.random() * 360}, 100%, 65%)`;
      } else if (confettiType === 1) {
        // Heart shape
        confetti.innerHTML = '♥';
        confetti.style.fontSize = `${Math.random() * 15 + 10}px`;
        confetti.style.color = `hsl(${Math.random() * 60 + 320}, 100%, 65%)`;
      } else {
        // Regular confetti
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 65%)`;
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      }

      confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
      confettiContainer.remove();
    }, 6000);
  };

  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameStarted(false);
    setImageLoaded(false);
    setSolved(false);
    setMessage("Choose difficulty and start the game!");
    setElapsedTime(0);
    setCorrectPieces(0);
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
    const random =
      affirmations[Math.floor(Math.random() * affirmations.length)];
    setShowAffirmation(random);
    setTimeout(() => setShowAffirmation(""), 1500);
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

    puzzleContainerRef.current = puzzleContainer;

    const observer = new MutationObserver(() => {
      const solvedPieces = puzzleContainer.querySelectorAll(
        ".jigsaw-puzzle__piece--solved"
      ).length;

      if (solvedPieces > correctPieces && !solved) {
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
  }, [gameStarted, imageLoaded, correctPieces, solved]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl p-8 mb-8 border-4 border-purple-100">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
          ✨ Puzzle Fun Time ✨
        </h1>
        <p className="text-center text-gray-500 mb-8">Challenge your mind with our beautiful puzzles</p>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-md relative">
            {!gameStarted && !loading && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl shadow-md mb-6 border-2 border-purple-200">
                <h2 className="text-2xl font-semibold text-purple-800 mb-6 text-center">
                  Choose Your Challenge 🧩
                </h2>
                <div className="flex justify-between gap-4 mb-8">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.name}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-4 px-4 rounded-xl transition-all duration-300 flex flex-col items-center ${difficulty.name === level.name
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                          : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-purple-200"
                        }`}
                    >
                      <span className="text-2xl mb-1">{level.emoji}</span>
                      <span>{level.name}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleStartGame}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-xl shadow-md transform transition duration-300 hover:shadow-lg hover:from-purple-600 hover:to-pink-600 text-lg"
                >
                  Let's Play! 🎮
                </button>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-2xl p-12 text-center shadow-md border-2 border-purple-100">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-purple-500 border-r-pink-500 border-b-blue-500 border-l-transparent animate-spin"></div>
                  <div className="absolute top-2 left-2 w-16 h-16 rounded-full border-4 border-t-transparent border-r-transparent border-b-transparent border-l-pink-300 animate-spin"></div>
                </div>
                <p className="text-xl text-purple-700">Creating your puzzle magic...</p>
              </div>
            )}

            {gameStarted && (
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border-2 border-purple-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-md text-gray-700 bg-purple-50 py-2 px-4 rounded-full">
                      <span className="font-medium mr-1">Level:</span>
                      <span className="text-purple-600 font-bold">{difficulty.name}</span>
                      <span className="ml-2">{difficulty.emoji}</span>
                    </div>
                    <div className="flex items-center text-md bg-pink-50 py-2 px-4 rounded-full">
                      <span className="font-medium mr-2">⏱️</span>
                      <span className="text-pink-600 font-bold">{formatTime(elapsedTime)}</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(correctPieces / totalPieces) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-purple-600 font-medium">{correctPieces} of {totalPieces} pieces</span>
                    <span className="text-pink-600 font-medium">{Math.round((correctPieces / totalPieces) * 100)}% complete</span>
                  </div>
                </div>

                <div
                  className={`absolute left-1/2 transform -translate-x-1/2 z-20 text-lg font-bold px-6 py-3 rounded-full transition-all duration-500 ${showAffirmation
                      ? "opacity-100 -top-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "opacity-0 -top-8"
                    }`}
                >
                  {showAffirmation}
                </div>

                <div className="relative puzzle-container mb-6">
                  <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-100">
                    <JigsawPuzzle
                      imageSrc={selectedImage}
                      rows={difficulty.rows}
                      columns={difficulty.columns}
                      onSolved={handleSolved}
                      className="jigsaw-puzzle"
                    />
                  </div>

                  {showPreview && (
                    <div className="absolute top-8 right-8 w-36 h-36 border-4 border-white rounded-lg shadow-lg overflow-hidden z-20">
                      <img
                        src={selectedImage}
                        alt="Puzzle preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-500/70 to-pink-500/70 text-white text-xs py-1 text-center">
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
                className={`${showPreview
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    : "bg-gradient-to-r from-purple-100 to-blue-100 text-gray-700 hover:from-purple-200 hover:to-blue-200"
                  } font-medium py-3 px-6 rounded-full transition shadow-md flex items-center`}
              >
                {showPreview ? "Hide Preview 👁️" : "Show Preview 👁️"}
              </button>

              <button
                onClick={confirmOrRestart}
                className="bg-gradient-to-r from-orange-400 to-pink-500 text-blue font-medium py-3 px-6 rounded-full transition shadow-md hover:from-orange-500 hover:to-pink-600 flex items-center"
              >
                {solved ? "New Puzzle 🎮" : "Restart 🔄"}
              </button>
            </div>
          )}

          {solved && (
            <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-3 border-green-200 rounded-2xl p-8 text-center max-w-md animate-fade-in shadow-lg">
              <div className="inline-block bg-yellow-100 p-3 rounded-full mb-4">
                <span className="text-4xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-green-700 mb-3">
                Woohoo! You Did It! 🎉
              </h3>
              <p className="text-gray-700 mb-5">
                Amazing job! You completed the puzzle in{" "}
                <strong className="text-purple-600">{formatTime(Math.round((endTime - startTime) / 1000))}</strong>
              </p>
              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition hover:shadow-lg text-lg"
              >
                Play Again 🎮
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jigsaw_8_to_10;