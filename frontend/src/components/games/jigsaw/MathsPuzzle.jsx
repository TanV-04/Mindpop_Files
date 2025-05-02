import React, { useState, useEffect, useRef } from "react";
import "./mathsPuzzle.css";

// Define puzzle blocks based on the image
const puzzleBlocks = [
  { id: 1, color: "#e53935", number: 10, width: 1, height: 4, correctX: 0, correctY: 0 },
  { id: 2, color: "#2196f3", number: 5, width: 1, height: 1, correctX: 1, correctY: 0 },
  { id: 3, color: "#673ab7", number: 8, width: 1, height: 1, correctX: 2, correctY: 0 },
  { id: 4, color: "#fdd835", number: 9, width: 1, height: 2, correctX: 3, correctY: 0 },
  { id: 5, color: "#4caf50", number: 6, width: 1, height: 1, correctX: 1, correctY: 1 },
  { id: 6, color: "#fdd835", number: 7, width: 1, height: 2, correctX: 2, correctY: 1 },
  { id: 7, color: "#e53935", number: 1, width: 0.5, height: 0.5, correctX: 2.5, correctY: 1 },
  { id: 8, color: "#4caf50", number: 2, width: 0.5, height: 0.5, correctX: 2.5, correctY: 1.5 },
  { id: 9, color: "#e53935", number: 4, width: 0.5, height: 1, correctX: 2.5, correctY: 2 },
  { id: 10, color: "#2196f3", number: 3, width: 0.5, height: 1, correctX: 3, correctY: 2 },
];

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

const MathsPuzzle = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState("Click Start Game to begin!");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [solved, setSolved] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAffirmation, setShowAffirmation] = useState("");
  const [placedBlocks, setPlacedBlocks] = useState([]);
  const [correctPlacements, setCorrectPlacements] = useState(0);

  const timerRef = useRef(null);
  const boardRef = useRef(null);

  // Start game handler
  const handleStartGame = () => {
    setGameStarted(true);
    setMessage("Drag the blocks onto the board to solve the puzzle.");
    setPlacedBlocks([]);
    setCorrectPlacements(0);
    const now = Date.now();
    setStartTime(now);

    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - now) / 1000));
    }, 1000);
  };

  // Cleanup timer on unmount or when solved
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Check if the puzzle is solved
  useEffect(() => {
    if (correctPlacements === puzzleBlocks.length && correctPlacements > 0) {
      const now = Date.now();
      setEndTime(now);
      setSolved(true);
      setMessage("🎉 Puzzle completed! Great work!");
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [correctPlacements]);

  const showRandomAffirmation = () => {
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];
    setShowAffirmation(random);
    setTimeout(() => {
      setShowAffirmation("");
    }, 1500);
  };

  const handleDragStart = (e, block) => {
    e.dataTransfer.setData("blockId", block.id);
    
    // Create a ghost image for dragging
    const ghost = document.createElement("div");
    ghost.classList.add("drag-ghost");
    ghost.style.width = `${block.width * 100}px`;
    ghost.style.height = `${block.height * 100}px`;
    ghost.style.backgroundColor = block.color;
    ghost.textContent = block.number;
    document.body.appendChild(ghost);
    
    e.dataTransfer.setDragImage(ghost, 25, 25);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const blockId = parseInt(e.dataTransfer.getData("blockId"));
    const block = puzzleBlocks.find(b => b.id === blockId);
    
    if (!block) return;
    
    // Get board position
    const boardRect = boardRef.current.getBoundingClientRect();
    const gridSize = 100; // Each grid unit is 100px
    
    const x = Math.round((e.clientX - boardRect.left) / gridSize);
    const y = Math.round((e.clientY - boardRect.top) / gridSize);
    
    // Check if placement is correct
    const isCorrect = (x === block.correctX && y === block.correctY);
    
    // Add the block to the placed blocks
    const updatedPlacedBlocks = [
      ...placedBlocks.filter(b => b.id !== blockId),
      { ...block, x, y, isCorrect }
    ];
    
    setPlacedBlocks(updatedPlacedBlocks);
    
    // Count correct placements
    const correctCount = updatedPlacedBlocks.filter(b => b.isCorrect).length;
    setCorrectPlacements(correctCount);
    
    if (isCorrect) {
      showRandomAffirmation();
    }
  };

  const handleRestart = () => {
    setSolved(false);
    setPlacedBlocks([]);
    setCorrectPlacements(0);
    setMessage("Click Start Game to begin!");
    setGameStarted(false);
    setElapsedTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Get available blocks (those not yet placed or incorrectly placed)
  const availableBlocks = puzzleBlocks.filter(
    block => !placedBlocks.some(placed => placed.id === block.id && placed.isCorrect)
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 to-blue-100 p-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">Arithmetic Wooden Puzzle</h1>

      <div className="text-lg text-gray-700 mb-2">{message}</div>

      {!gameStarted && (
        <button
          onClick={handleStartGame}
          className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md mb-8 transform transition duration-200 hover:scale-105 hover:bg-blue-700"
        >
          Start Game
        </button>
      )}

      {gameStarted && !solved && (
        <div className="text-md text-gray-600 mb-4">
          ⏱️ Time: <strong>{elapsedTime}</strong> sec | Correct pieces: {correctPlacements}/{puzzleBlocks.length}
        </div>
      )}

      <div
        className={`text-green-700 font-semibold mb-3 transition-opacity duration-500 ease-in-out text-center min-h-[1.5rem] ${
          showAffirmation ? "opacity-100" : "opacity-0"
        }`}
      >
        {showAffirmation || ""}
      </div>

      {gameStarted && (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Wooden puzzle board */}
          <div 
            ref={boardRef}
            className="wooden-board"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Placed blocks */}
            {placedBlocks.map(block => (
              <div
                key={block.id}
                className={`puzzle-block ${block.isCorrect ? 'correct' : 'incorrect'}`}
                style={{
                  backgroundColor: block.color,
                  width: `${block.width * 100}px`,
                  height: `${block.height * 100}px`,
                  left: `${block.x * 100}px`,
                  top: `${block.y * 100}px`,
                }}
                draggable={!block.isCorrect}
                onDragStart={!block.isCorrect ? (e) => handleDragStart(e, block) : null}
              >
                <span className="block-number">{block.number}</span>
              </div>
            ))}
          </div>

          {/* Block selection area */}
          <div className="blocks-container">
            <h3 className="text-lg font-semibold mb-2">Available Blocks</h3>
            <div className="available-blocks">
              {availableBlocks.map(block => (
                <div
                  key={block.id}
                  className="puzzle-block"
                  style={{
                    backgroundColor: block.color,
                    width: `${block.width * 100}px`,
                    height: `${block.height * 100}px`,
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, block)}
                >
                  <span className="block-number">{block.number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {solved && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 text-center">
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Puzzle Completed!
          </h3>
          <p className="text-gray-700">
            Total time: <strong>{Math.round((endTime - startTime) / 1000)}</strong> seconds
          </p>
        </div>
      )}

      {gameStarted && (
        <button
          onClick={handleRestart}
          className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-md transform transition duration-200 hover:scale-105 hover:bg-orange-600 mt-8"
        >
          Restart
        </button>
      )}
    </div>
  );
};

export default MathsPuzzle;
