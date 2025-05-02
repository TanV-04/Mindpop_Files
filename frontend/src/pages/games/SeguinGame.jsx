import { useState, useEffect } from "react";
import Board from "../../components/games/seguin-board/Board";
import Timer from "../../components/games/seguin-board/Timer";
import ScoreBoard from "../../components/games/seguin-board/ScoreBoard";
import Instructions from "../../components/games/seguin-board/Instructions";
import { userService } from "../../utils/apiService";
import "../../components/games/seguin-board/styles/seguin.css";

const SeguinGame = () => {
  const [gameState, setGameState] = useState("loading"); // loading, playing, completed
  const [time, setTime] = useState(0);
  const [difficulty, setDifficulty] = useState("normal"); // easy, normal, hard
  const [age, setAge] = useState(null);
  const [completedAllShapes, setCompletedAllShapes] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    console.log("Component mounted, fetching user data");
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // First try to get age from current user profile
        const userData = await userService.getCurrentUser();
        console.log("User data fetched:", userData);
        
        let userAge;
        
        // Check if the user data contains age information
        if (userData && userData.age) {
          userAge = userData.age;
          console.log("User age from profile:", userAge);
        } else {
          // Fallback: Try to get age from localStorage (might have been stored at login)
          const storedAge = localStorage.getItem('userAge');
          if (storedAge) {
            userAge = parseInt(storedAge, 10);
            console.log("User age from localStorage:", userAge);
          } else {
            // Default age if no age is available
            userAge = 10;
            console.log("Using default age:", userAge);
          }
        }
        
        // Set the age state
        setAge(userAge);
        
        // Set difficulty based on age
        if (userAge < 7) {
          setDifficulty("easy");
        } else if (userAge > 10) {
          setDifficulty("hard");
        } else {
          setDifficulty("normal");
        }
        
        console.log(`Age determined: ${userAge}, Difficulty set to: ${
          userAge < 7 ? "easy" : userAge > 10 ? "hard" : "normal"
        }`);
        
        // Ready to start
        setGameState("playing");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        // Fallback to default age in case of error
        const defaultAge = 10;
        setAge(defaultAge);
        setDifficulty("normal");
        console.log(`Using default age ${defaultAge} due to error`);
        
        setGameState("playing");
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    return () => {
      console.log("Component unmounting, cleaning up");
    };
  }, []);

  useEffect(() => {
    console.log(
      `Game state changed: ${gameState}, Completed all shapes: ${completedAllShapes}`
    );
  }, [gameState, completedAllShapes]);

  const handleGameComplete = () => {
    console.log(`Game ACTUALLY completed with time: ${time}`);
    console.log(
      `Final state - Game State: ${gameState}, Age: ${age}, Difficulty: ${difficulty}`
    );
    setCompletedAllShapes(true);
    setGameState("completed");
    const completionSound = new Audio(
      "https://cdn.freesound.org/previews/320/320654_5260872-lq.mp3"
    );
    completionSound.play().catch((e) => console.log("Audio play failed:", e));
    console.log("FINAL GAME COMPLETED - showing results!");
  };

  const playAgain = () => {
    setGameState("playing");
    setTime(0);
    setCompletedAllShapes(false);
  };
  
  // Get appropriate instructions based on user age
  const getInstructions = () => {
    if (age < 7) {
      return "Match each shape to its outline on the board! Drag the shapes from the tray to the matching spaces. Can you find where each shape belongs?";
    } else if (age < 10) {
      return "Drag each shape from the tray to its matching outline on the board. You need to place ALL TEN shapes to complete the game!";
    } else {
      return "Complete the Seguin Form Board by matching each shape to its outline. This exercise helps develop visual processing skills and spatial awareness. Try to complete it as quickly as possible!";
    }
  };

  const renderLoading = () => (
    <div className="loading-container flex items-center justify-center h-64 bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
      <div className="loading-spinner mr-3 h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#F09000] border-r-transparent"></div>
      <p className="text-lg font-semibold text-[#66220B]">
        Loading game...
      </p>
    </div>
  );

  const renderGame = () => (
    <>
      <div className="max-w-2xl mx-auto mb-4 bg-white rounded-lg shadow-md p-3 text-center">
        <p className="text-[#66220B] font-bold">
          Playing as age {age} | Difficulty: {difficulty}
        </p>
      </div>
      <Instructions
        text={getInstructions()}
        isChild={age < 10}
      />
      <Timer
        isRunning={gameState === "playing" && !completedAllShapes}
        onTimeUpdate={setTime}
      />
      <Board
        onComplete={handleGameComplete}
        difficulty={difficulty}
        key={gameState}
      />
    </>
  );

  console.log("Current state:", { gameState, age, difficulty, time });

  return (
    <div className="seguin-game-container py-8 px-4">
      {import.meta.env.DEV && (
        <div className="bg-gray-100 p-2 text-xs text-gray-600 rounded mb-2 max-w-md mx-auto">
          Game State: {gameState}, Age: {age || "not set"}, Difficulty:{" "}
          {difficulty}, Completed: {completedAllShapes ? "Yes" : "No"}
        </div>
      )}
      
      {gameState === "loading" && renderLoading()}
      {gameState === "playing" && renderGame()}
      {gameState === "completed" && (
        <ScoreBoard time={time} age={age} onPlayAgain={playAgain} />
      )}
    </div>
  );
};

export default SeguinGame;