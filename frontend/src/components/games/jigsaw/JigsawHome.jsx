import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PuzzleLogo from '../jigsaw/PuzzleLogo';
import { progressService } from "../../../utils/apiService";
import { useParams } from "react-router-dom";

function JigsawHome() {
  const [age, setAge] = useState(5);
  const [difficulty, setDifficulty] = useState('easy');
  const [theme, setTheme] = useState('animals');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartGame = () => {
    setIsLoading(true);
    // Pass the parameters to the game page
    navigate('/jigsaw/jigsawstart', { 
      state: { 
        age, 
        difficulty, 
        theme 
      } 
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center space-y-2">
          <PuzzleLogo className="w-24 h-24" />
          <h1 className="text-3xl font-bold text-center text-purple-700">Jigsaw Puzzle Game</h1>
          <p className="text-gray-600 text-center">Create fun puzzles with AI!</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How old are you?
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="3"
                max="12"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-bold text-purple-700 min-w-8">{age}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium capitalize ${
                    difficulty === level
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Picture Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['animals', 'space', 'dinosaurs', 'fairy tales', 'ocean', 'forest'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium capitalize ${
                    theme === t
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-md hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70"
          >
            {isLoading ? 'Creating your puzzle...' : 'Start Game!'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JigsawHome;
