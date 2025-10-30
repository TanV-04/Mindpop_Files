import React, { useState, useEffect, useRef } from "react";
import { JigsawPuzzle } from "react-jigsaw-puzzle/lib";
import "react-jigsaw-puzzle/lib/jigsaw-puzzle.css";
//import "./jigsaw.css";

const imageModules = import.meta.glob(
  "/src/assets/images_for_jigsaw_6_to_8/*.{png,jpg,jpeg,svg}",
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

const Jigsaw_6_to_8 = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [message, setMessage] = useState("Click Start Game to begin!");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [solved, setSolved] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAffirmation, setShowAffirmation] = useState("");
  const [correctPieces, setCorrectPieces] = useState(0);

  const timerRef = useRef(null);

  const handleStartGame = () => {
    setGameStarted(true);
    setMessage("Loading puzzle...");
    setCorrectPieces(0);

    const randomImage = IMAGES[Math.floor(Math.random() * IMAGES.length)];
    setSelectedImage(randomImage);

    const img = new window.Image();
    img.src = randomImage;
    img.onload = () => {
      setImageLoaded(true);
      setMessage("Drag pieces onto the board.");
      const now = Date.now();
      setStartTime(now);

      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - now) / 1000));
      }, 1000);
    };
  };

  const handleSolved = () => {
    const now = Date.now();
    setEndTime(now);
    setSolved(true);
    setMessage("🎉 Puzzle completed! Great work!");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const confirmOrRestart = () => {
    if (!solved) {
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
    const puzzleContainer = document.querySelector(".jigsaw-puzzle");

    if (!puzzleContainer || !imageLoaded) return;

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
  }, [imageLoaded, correctPieces, solved]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 to-blue-100 p-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">Jigsaw Puzzle</h1>

      <div className="text-lg text-gray-700 mb-2">{message}</div>

      {!gameStarted && (
        <button
          onClick={handleStartGame}
          className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md mb-8 transform transition duration-200 hover:scale-105 hover:bg-blue-700"
        >
          Start Game
        </button>
      )}

      {gameStarted && !solved && imageLoaded && (
        <div className="text-md text-gray-600 mb-4">
          ⏱️ Time: <strong>{elapsedTime}</strong> sec
        </div>
      )}

      <div
        className={`text-green-700 font-semibold mb-3 transition-opacity duration-500 ease-in-out text-center min-h-[1.5rem] ${
          showAffirmation ? "opacity-100" : "opacity-0"
        }`}
      >
        💡 {showAffirmation || "‎"}
      </div>

      <div className="w-full max-w-md mb-8">
        {gameStarted && selectedImage && imageLoaded && (
          <JigsawPuzzle
            imageSrc={selectedImage}
            rows={3}
            columns={3}
            onSolved={handleSolved}
            className="jigsaw-puzzle"
          />
        )}
      </div>

      {solved && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 text-center">
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Puzzle Completed!
          </h3>
          <p className="text-gray-700">
            Total time:{" "}
            <strong>{Math.round((endTime - startTime) / 1000)}</strong> seconds
          </p>
        </div>
      )}
      
      {gameStarted && (
        <button
          onClick={confirmOrRestart}
          className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-md transition duration-200 hover:scale-105 hover:bg-orange-600 shadow-md"
        >
          Restart
        </button>
      )}
    </div>
  );
};

export default Jigsaw_6_to_8;
