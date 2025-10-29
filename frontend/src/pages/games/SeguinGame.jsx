// import { useState, useEffect } from "react";
// import Board from "../../components/games/seguin-board/Board";
// import Timer from "../../components/games/seguin-board/Timer";
// import ScoreBoard from "../../components/games/seguin-board/ScoreBoard";
// import Instructions from "../../components/games/seguin-board/Instructions";
// import "../../components/games/seguin-board/styles/seguin.css";

// const SeguinGame = () => {
//   const [gameState, setGameState] = useState("intro"); // intro, playing, completed
//   const [time, setTime] = useState(0);
//   const [difficulty, setDifficulty] = useState("normal"); // easy, normal, hard
//   const [age, setAge] = useState(null);
//   const [completedAllShapes, setCompletedAllShapes] = useState(false);

//   useEffect(() => {
//     console.log("Component mounted, resetting game state");
//     setGameState("intro");
//     setTime(0);
//     setAge(null);
//     setDifficulty("normal");
//     setCompletedAllShapes(false);

//     return () => {
//       console.log("Component unmounting, cleaning up");
//     };
//   }, []);

//   useEffect(() => {
//     console.log(
//       `Game state changed: ${gameState}, Completed all shapes: ${completedAllShapes}`
//     );
//   }, [gameState, completedAllShapes]);

//   const handleAgeSelect = (selectedAge) => {
//     setAge(selectedAge);
//     if (selectedAge < 7) {
//       setDifficulty("easy");
//     } else if (selectedAge > 10) {
//       setDifficulty("hard");
//     } else {
//       setDifficulty("normal");
//     }
//     console.log(
//       `Age selected: ${selectedAge}, Difficulty set to: ${
//         selectedAge < 7 ? "easy" : selectedAge > 10 ? "hard" : "normal"
//       }`
//     );
//   };

//   const startGame = () => {
//     if (age === null) {
//       console.log("Cannot start game without age selection");
//       return;
//     }
//     setCompletedAllShapes(false);
//     console.log(`Starting game with age ${age} and difficulty ${difficulty}`);
//     setGameState("playing");
//     setTime(0);
//   };

//   const handleGameComplete = () => {
//     console.log(`Game ACTUALLY completed with time: ${time}`);
//     console.log(
//       `Final state - Game State: ${gameState}, Age: ${age}, Difficulty: ${difficulty}`
//     );
//     setCompletedAllShapes(true);
//     setGameState("completed");

//     const completionSound = new Audio(
//       "https://cdn.freesound.org/previews/320/320654_5260872-lq.mp3"
//     );
//     completionSound.play().catch((e) => console.log("Audio play failed:", e));

//     console.log("FINAL GAME COMPLETED - showing results!");
//   };

//   const playAgain = () => {
//     setGameState("playing");
//     setTime(0);
//     setCompletedAllShapes(false);
//   };

//   // Get instructions text based on age
//   const getInstructions = () => {
//     if (age < 7) {
//       return "Match each shape to its outline on the board! Drag the shapes from the tray to the matching spaces. Can you find where each shape belongs?";
//     } else if (age < 10) {
//       return "Drag each shape from the tray to its matching outline on the board. You need to place ALL TEN shapes to complete the game!";
//     } else {
//       return "Complete the Seguin Form Board by matching each shape to its outline. This exercise helps develop visual processing skills and spatial awareness. Try to complete it as quickly as possible!";
//     }
//   };

//   const renderIntro = () => {
//     console.log("Rendering intro with age:", age);
//     return (
//       <div className="intro-container bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
//         <h2 className="text-2xl font-bold text-[#66220B] mb-4">
//           Seguin Form Board Game
//         </h2>
//         <p className="text-gray-700 mb-6">
//           This game tests your ability to match shapes to their outlines.
//         </p>
//         <div className="mb-6">
//           <p className="text-lg font-semibold text-[#66220B] mb-4">
//             Select Your Age
//           </p>
//           <div className="grid grid-cols-4 gap-3 justify-center">
//             {[5, 6, 7, 8, 9, 10, 11, 12].map((ageOption) => (
//               <button
//                 key={ageOption}
//                 type="button"
//                 className={`age-btn px-4 py-2 rounded-lg border-2 transition-all duration-200 text-lg font-medium 
//                   ${
//                     age === ageOption
//                       ? "bg-[#F09000] text-white border-[#F09000] scale-110 shadow-lg"
//                       : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300"
//                   }`}
//                 onClick={() => handleAgeSelect(ageOption)}
//               >
//                 {ageOption}
//               </button>
//             ))}
//           </div>
//           {age !== null && (
//             <p className="text-green-600 mt-3 font-semibold">
//               You selected age: {age}
//             </p>
//           )}
//         </div>
//         <button
//           type="button"
//           className={`start-button bg-red-700 relative bg-gradient-to-r from-[#00C853] to-[#B2FF59] text-black font-extrabold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out
//             ${
//               age === null
//                 ? "opacity-50 cursor-not-allowed"
//                 : "hover:scale-105 hover:shadow-green-400/60"
//             }`}
//           style={{
//             backdropFilter: "blur(12px)",
//             boxShadow: "0 8px 20px rgba(0, 200, 83, 0.4)",
//             border: "2px solid rgba(255, 255, 255, 0.2)",
//             letterSpacing: "1px",
//           }}
//           onClick={() => {
//             if (age !== null) {
//               console.log("Starting game with age:", age);
//               startGame();
//             }
//           }}
//           disabled={age === null}
//         >
//           <span className="absolute inset-0 rounded-full bg-white opacity-10 blur-sm"></span>
//           <span className="relative z-10">Start Game!</span>
//         </button>
//       </div>
//     );
//   };

//   const renderGame = () => (
//     <>
//       <div className="max-w-2xl mx-auto mb-4 bg-white rounded-lg shadow-md p-3 text-center">
//         <p className="text-[#66220B] font-bold">
//           Playing as age {age} | Difficulty: {difficulty}
//         </p>
//       </div>
//       <Instructions text={getInstructions()} isChild={age < 10} />
//       <Timer
//         isRunning={gameState === "playing" && !completedAllShapes}
//         onTimeUpdate={setTime}
//       />
//       <Board
//         onComplete={handleGameComplete}
//         difficulty={difficulty}
//         key={gameState}
//       />
//     </>
//   );

//   console.log("Current state:", { gameState, age, difficulty, time });

//   return (
//     <div className="seguin-game-container py-8 px-4">
//       {import.meta.env.DEV && (
//         <div className="bg-gray-100 p-2 text-xs text-gray-600 rounded mb-2 max-w-md mx-auto">
//           Game State: {gameState}, Age: {age || "not set"}, Difficulty: {difficulty}, Completed:{" "}
//           {completedAllShapes ? "Yes" : "No"}
//         </div>
//       )}
//       {gameState === "intro" && renderIntro()}
//       {gameState === "playing" && renderGame()}
//       {gameState === "completed" && (
//         <ScoreBoard time={time} age={age} onPlayAgain={playAgain} />
//       )}
//     </div>
//   );
// };

// export default SeguinGame;

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