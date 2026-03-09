// frontend/src/pages/games/SeguinGame.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Board from "../../components/games/seguin-board/Board";
import Timer from "../../components/games/seguin-board/Timer";
import ScoreBoard from "../../components/games/seguin-board/ScoreBoard";
import Instructions from "../../components/games/seguin-board/Instructions";
import "../../components/games/seguin-board/styles/seguin.css";
import { useNavigate, useBeforeUnload } from "react-router-dom";

// ── Helper: compute age from birthDate ────────────────────────────────
const computeAge = (birthDateStr) => {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

// ── Helper: read user data from localStorage ──────────────────────────
const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return { name: "Player", age: 10 };
    const user = JSON.parse(raw);
    let age = user.age ? Number(user.age) : computeAge(user.birthDate);
    if (!age || isNaN(age)) age = 10;
    return { name: user.name || "Player", age };
  } catch {
    return { name: "Player", age: 10 };
  }
};

const SeguinGame = () => {
  const { name: initialName, age: initialAge } = getUserFromStorage();
  const getDifficulty = (age) => (age < 7 ? "easy" : age > 10 ? "hard" : "normal");

  const [gameState, setGameState] = useState("start"); // start | playing | completed
  const [time, setTime] = useState(0);
  const [age] = useState(initialAge);
  const [difficulty] = useState(getDifficulty(initialAge));
  const [userName] = useState(initialName);
  const [completedAllShapes, setCompletedAllShapes] = useState(false);

  const navigate = useNavigate();

  useBeforeUnload(
    gameState === "playing" && !completedAllShapes
      ? (event) => {
          event.preventDefault();
          event.returnValue = "Your progress will not be saved. Are you sure you want to leave?";
        }
      : undefined
  );

  useEffect(() => {
    const handleBeforeRouteChange = (event) => {
      if (gameState === "playing" && !completedAllShapes) {
        const confirmLeave = window.confirm(
          "Do you want to go back? Your progress will not be saved."
        );
        if (confirmLeave) {
          navigate("/games");
        } else {
          event.preventDefault();
          window.history.pushState(null, "", window.location.href);
        }
      }
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBeforeRouteChange);
    return () => window.removeEventListener("popstate", handleBeforeRouteChange);
  }, [gameState, completedAllShapes, navigate]);

  const startGame = () => {
    setCompletedAllShapes(false);
    setTime(0);
    setGameState("playing");
  };

  const handleGameComplete = () => {
    setCompletedAllShapes(true);
    setGameState("completed");
    const completionSound = new Audio(
      "https://cdn.freesound.org/previews/320/320654_5260872-lq.mp3"
    );
    completionSound.play().catch(() => {});
  };

  const playAgain = () => {
    setGameState("playing");
    setTime(0);
    setCompletedAllShapes(false);
  };

  const goBackToGames = () => {
    navigate("/games");
  };

  const getInstructions = () => {
    if (age < 7)
      return "Match each shape to its outline on the board! Drag the shapes from the tray to the matching spaces.";
    if (age < 10)
      return "Drag each shape from the tray to its matching outline on the board. You need to place ALL TEN shapes to complete the game!";
    return "Complete the Seguin Form Board by matching each shape to its outline. Try to complete it as quickly as possible!";
  };

  // ── START SCREEN (matching Balloon Pop / Jigsaw style) ────────────────
  const renderStartScreen = () => (
    <motion.div
      className="game-screen start-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        width: "100%",
        minHeight: "10vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #F9F0D0 0%, #FFE5B4 100%)",
      }}
    >
      <div
        className="start-content"
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "3rem 2rem",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 10px 40px rgba(102, 34, 11, 0.15)",
          border: "3px solid #F09000",
        }}
      >
        <h1
          className="game-title quicksand"
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#66220B",
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          🔷 Shape Matcher
        </h1>
        <p
          className="game-subtitle"
          style={{
            fontSize: "1.2rem",
            color: "#66220B",
            textAlign: "center",
            marginBottom: "1.5rem",
            fontWeight: "600",
          }}
        >
          Seguin Form Board Game
        </p>
        
        <div
          className="game-instructions"
          style={{
            background: "linear-gradient(135deg, #FFF5E6 0%, #FFE5B4 100%)",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            border: "2px solid #F09000",
          }}
        >
          <p style={{ fontSize: "1rem", color: "#66220B", lineHeight: "1.6", marginBottom: "1rem" }}>
            {getInstructions()}
          </p>
          <div
            className="difficulty-info"
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "2px dashed #F09000",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.85rem", color: "#8B4513", marginBottom: "0.25rem" }}>
                Player
              </p>
              <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#66220B" }}>
                {userName}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.85rem", color: "#8B4513", marginBottom: "0.25rem" }}>
                Age
              </p>
              <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#66220B" }}>
                {age} years
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.85rem", color: "#8B4513", marginBottom: "0.25rem" }}>
                Difficulty
              </p>
              <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#F09000" }}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            className="start-button quicksand"
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg, #00C853 0%, #B2FF59 100%)",
              color: "black",
              border: "none",
              padding: "1rem 2rem",
              fontSize: "1.25rem",
              fontWeight: "bold",
              borderRadius: "50px",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(0, 200, 83, 0.3)",
              transition: "all 0.3s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 10px 30px rgba(0, 200, 83, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 6px 20px rgba(0, 200, 83, 0.3)";
            }}
          >
            ▶ Start Game!
          </button>
          
          <button
            className="back-button quicksand"
            onClick={goBackToGames}
            style={{
              background: "transparent",
              color: "#66220B",
              border: "2px solid #66220B",
              padding: "0.875rem 2rem",
              fontSize: "1rem",
              fontWeight: "600",
              borderRadius: "50px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#66220B";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#66220B";
            }}
          >
            ← Back to Games
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderGame = () => (
    <>
      <div className="max-w-2xl mx-auto mb-4 bg-white rounded-lg shadow-md p-3 text-center">
        <p className="text-[#66220B] font-bold">
          Playing as {userName} | Age: {age} | Difficulty: {difficulty}
        </p>
      </div>
      <Instructions text={getInstructions()} isChild={age < 10} />
      <Timer
        isRunning={gameState === "playing" && !completedAllShapes}
        onTimeUpdate={setTime}
      />
      <Board onComplete={handleGameComplete} difficulty={difficulty} key={gameState} />
    </>
  );

  return (
    <div className="seguin-game-container py-8 px-4 min-h-screen">
      {gameState === "start" && renderStartScreen()}
      {gameState === "playing" && renderGame()}
      {gameState === "completed" && (
        <ScoreBoard time={time} age={age} onPlayAgain={playAgain} />
      )}
    </div>
  );
};

export default SeguinGame;