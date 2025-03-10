import  { useState, useEffect } from 'react';
import Board from '../../components/games/seguin-board/Board';
import Timer from '../../components/games/seguin-board/Timer';
import ScoreBoard from '../../components/games/seguin-board/ScoreBoard';
import Instructions from '../../components/games/seguin-board/Instructions';
import '../../components/games/seguin-board/styles/seguin.css';

const SeguinGame = () => {
  const [gameState, setGameState] = useState('intro'); // intro, playing, completed
  const [time, setTime] = useState(0);
  const [difficulty, setDifficulty] = useState('normal'); // easy, normal, hard
  const [age, setAge] = useState(null);
  const [completedAllShapes, setCompletedAllShapes] = useState(false);

  useEffect(() => {
    console.log("Component mounted, resetting game state");
    setGameState('intro');
    setTime(0);
    setAge(null);
    setDifficulty('normal');
    setCompletedAllShapes(false);
    
    return () => {
      console.log("Component unmounting, cleaning up");
    };
  }, []);

  useEffect(() => {
    console.log(`Game state changed: ${gameState}, Completed all shapes: ${completedAllShapes}`);
  }, [gameState, completedAllShapes]);

  const handleAgeSelect = (selectedAge) => {
    setAge(selectedAge);
    if (selectedAge < 7) {
      setDifficulty('easy');
    } else if (selectedAge > 10) {
      setDifficulty('hard');
    } else {
      setDifficulty('normal');
    }
    console.log(`Age selected: ${selectedAge}, Difficulty set to: ${selectedAge < 7 ? 'easy' : (selectedAge > 10 ? 'hard' : 'normal')}`);
  };

  const startGame = () => {
    if (age === null) {
      console.log("Cannot start game without age selection");
      return;
    }
    setCompletedAllShapes(false);
    console.log(`Starting game with age ${age} and difficulty ${difficulty}`);
    setGameState('playing');
    setTime(0);
  };

  const handleGameComplete = () => {
    console.log(`Game ACTUALLY completed with time: ${time}`);
    console.log(`Final state - Game State: ${gameState}, Age: ${age}, Difficulty: ${difficulty}`);
    setCompletedAllShapes(true);
    setGameState('completed');
    const completionSound = new Audio('https://cdn.freesound.org/previews/320/320654_5260872-lq.mp3');
    completionSound.play().catch(e => console.log('Audio play failed:', e));
    console.log("FINAL GAME COMPLETED - showing results!");
  };

  const playAgain = () => {
    setGameState('playing');
    setTime(0);
    setCompletedAllShapes(false);
  };

  const renderIntro = () => {
    console.log("Rendering intro with age:", age);
    return (
      <div className="intro-container bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-[#66220B] mb-4">Seguin Form Board Game</h2>
        <p className="text-gray-700 mb-6">This game tests your ability to match shapes to their outlines.</p>
        <div className="mb-6">
          <p className="text-lg font-semibold text-[#66220B] mb-4">Select Your Age</p>
          <div className="grid grid-cols-4 gap-3 justify-center">
            {[5, 6, 7, 8, 9, 10, 11, 12].map(ageOption => (
              <button
                key={ageOption}
                type="button"
                className={`age-btn px-4 py-2 rounded-lg border-2 transition-all duration-200 text-lg font-medium 
                  ${age === ageOption ? 'bg-[#F09000] text-white border-[#F09000] scale-110 shadow-lg' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'}`}
                onClick={() => handleAgeSelect(ageOption)}
              >
                {ageOption}
              </button>
            ))}
          </div>
          {age !== null && <p className="text-green-600 mt-3 font-semibold">You selected age: {age}</p>}
        </div>
        <button 
          type="button"
          className={`start-button bg-[#F09000] text-black font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 
            ${age === null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#D87D00] hover:scale-110 shadow-lg animate-pulse'}`} 
          style={{
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(240, 144, 0, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
          onClick={() => { if (age !== null) { console.log("Starting game with age:", age); startGame(); } }}
          disabled={age === null}
        >
          Start Game!
        </button>
      </div>
    );
  };

  const renderGame = () => (
    <>
      <div className="max-w-2xl mx-auto mb-4 bg-white rounded-lg shadow-md p-3 text-center">
        <p className="text-[#66220B] font-bold">Playing as age {age} | Difficulty: {difficulty}</p>
      </div>
      <Instructions 
        text="Drag each shape from the tray to its matching outline on the board. You must place ALL TEN shapes to complete the game!"
        isChild={true}
      />
      <Timer isRunning={gameState === 'playing' && !completedAllShapes} onTimeUpdate={setTime} />
      <Board onComplete={handleGameComplete} difficulty={difficulty} key={gameState} />
    </>
  );

  console.log("Current state:", { gameState, age, difficulty, time });

  return (
    <div className="seguin-game-container py-8 px-4">
      {import.meta.env.DEV && (
        <div className="bg-gray-100 p-2 text-xs text-gray-600 rounded mb-2 max-w-md mx-auto">
          Game State: {gameState}, Age: {age || 'not set'}, Difficulty: {difficulty}, Completed: {completedAllShapes ? 'Yes' : 'No'}
        </div>
      )}
      {gameState === 'intro' && renderIntro()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'completed' && <ScoreBoard time={time} age={age} onPlayAgain={playAgain} />}
    </div>
  );
};

export default SeguinGame;
