import React, { useState, useEffect, useRef } from "react";
import { JigsawPuzzle } from "react-jigsaw-puzzle/lib";
import "react-jigsaw-puzzle/lib/jigsaw-puzzle.css";
import "./jigsaw.css";

const IMAGES = [
  "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1502764613149-7f1d229e2300?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1609945288404-d66ea0dc5c1b?w=600&h=600&fit=crop",
];

const Jigsaw = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [message, setMessage] = useState("Click Start Game to begin!");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [solved, setSolved] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timerRef = useRef(null);

  // Start game handler
  const handleStartGame = () => {
    setGameStarted(true);
    setMessage("Loading puzzle...");

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

  // Cleanup timer on unmount or when solved
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
        <div className="text-md text-gray-600 mb-6">
          ⏱️ Time: <strong>{elapsedTime}</strong> sec
        </div>
      )}

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

      <button
        onClick={handleRestart}
        className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-md transform transition duration-200 hover:scale-105 hover:bg-orange-600"
      >
        Restart
      </button>
    </div>
  );
};

export default Jigsaw;
