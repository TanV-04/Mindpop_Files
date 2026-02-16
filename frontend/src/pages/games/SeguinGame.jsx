//frontend\src\pages\games\SeguinGame.jsx
import { useState, useEffect } from "react";
import Board from "../../components/games/seguin-board/Board";
import Timer from "../../components/games/seguin-board/Timer";
import ScoreBoard from "../../components/games/seguin-board/ScoreBoard";
import Instructions from "../../components/games/seguin-board/Instructions";
import { userService } from "../../utils/apiService";
import "../../components/games/seguin-board/styles/seguin.css";
import { useNavigate, useBeforeUnload } from "react-router-dom";

const SeguinGame = () => {
  const [gameState, setGameState] = useState("loading"); // loading, intro, playing, completed
  const [time, setTime] = useState(0);
  const [difficulty, setDifficulty] = useState("normal");
  const [age, setAge] = useState(null);
  const [completedAllShapes, setCompletedAllShapes] = useState(false);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ 1. Warn before refreshing or closing the tab
  useBeforeUnload(
    gameState === "playing" && !completedAllShapes
      ? (event) => {
          event.preventDefault();
          event.returnValue =
            "Your progress will not be saved. Are you sure you want to leave?";
        }
      : undefined
  );

  // ✅ 2. Warn when user clicks browser back button or tries in-app navigation
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

    return () => {
      window.removeEventListener("popstate", handleBeforeRouteChange);
    };
  }, [gameState, completedAllShapes, navigate]);

  // ✅ 3. Fetch user data safely (merged from main)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Try to get from API
        const userData = await userService.getCurrentUser();
        let userAge;

        if (userData && userData.age) {
          userAge = userData.age;
          setUserName(userData.name || "Player");
        } else {
          const storedAge = localStorage.getItem("userAge");
          const storedUser = JSON.parse(localStorage.getItem("user"));
          if (storedAge) {
            userAge = parseInt(storedAge, 10);
            setUserName(storedUser?.name || "Player");
          } else {
            userAge = 10;
            setUserName("Player");
          }
        }

        setAge(userAge);
        setDifficulty(userAge < 7 ? "easy" : userAge > 10 ? "hard" : "normal");

        setGameState("intro");
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAge(10);
        setDifficulty("normal");
        setUserName("Player");
        setGameState("intro");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const startGame = () => {
    if (!age) return;
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

  const getInstructions = () => {
    if (age < 7)
      return "Match each shape to its outline on the board! Drag the shapes from the tray to the matching spaces.";
    if (age < 10)
      return "Drag each shape from the tray to its matching outline on the board. You need to place ALL TEN shapes to complete the game!";
    return "Complete the Seguin Form Board by matching each shape to its outline. Try to complete it as quickly as possible!";
  };

  // ✅ Intro screen
  const renderIntro = () => (
    <div className="intro-container bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold text-[#66220B] mb-4">
        Seguin Form Board Game
      </h2>
      <p className="text-gray-700 mb-6">
        This game tests your ability to match shapes to their outlines.
      </p>

      <p className="text-green-600 mt-3 font-semibold">
        Playing as {userName} | Age: {age} | Difficulty: {difficulty}
      </p>

      <button
        type="button"
        className="start-button bg-red-700 relative bg-gradient-to-r from-[#00C853] to-[#B2FF59] text-black font-extrabold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-green-400/60"
        style={{
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 20px rgba(0, 200, 83, 0.4)",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          letterSpacing: "1px",
        }}
        onClick={startGame}
      >
        <span className="absolute inset-0 rounded-full bg-white opacity-10 blur-sm"></span>
        <span className="relative z-10">Start Game!</span>
      </button>
    </div>
  );

  // ✅ Main game
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

  // ✅ Loading screen
  const renderLoading = () => (
    <div className="loading-container flex items-center justify-center h-64 bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
      <div className="loading-spinner mr-3 h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#F09000] border-r-transparent"></div>
      <p className="text-lg font-semibold text-[#66220B]">Loading game...</p>
    </div>
  );

  return (
    <div className="seguin-game-container py-8 px-4">
      {loading && renderLoading()}
      {!loading && gameState === "intro" && renderIntro()}
      {!loading && gameState === "playing" && renderGame()}
      {!loading && gameState === "completed" && (
        <ScoreBoard time={time} age={age} onPlayAgain={playAgain} />
      )}
    </div>
  );
};

export default SeguinGame;