import { Link } from 'react-router-dom';
import '../../components/games/seguin-board/styles/seguin.css';

const Games = () => {
  return (
    <div className="games-container pt-28 px-6 min-h-screen bg-[#F9F5EB]">
      <h1 className="text-3xl font-bold text-[#66220B] mb-8 quicksand">Learning & Assessment Games</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/games/seguin-board">
          <div className="game-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="icon flex justify-center mb-4">
              <i className="fa fa-puzzle-piece text-4xl text-[#F09000]"></i>
            </div>
            <h2 className="text-xl font-bold text-[#66220B] mb-4 text-center">Seguin Form Board</h2>
            <p className="text-gray-600 mb-4 text-center">Match shapes to their correct positions in this classic assessment tool.</p>
            <div className="flex justify-center">
              <span className="mt-4 text-[#F09000] font-semibold hover:underline">Start Playing →</span>
            </div>
          </div>
        </Link>
        
        {/* Placeholder for future games */}
        <div className="game-card bg-white rounded-xl shadow-lg p-6 opacity-60 cursor-not-allowed">
          <div className="icon flex justify-center mb-4">
            <i className="fa fa-gamepad text-4xl text-[#F09000]"></i>
          </div>
          <h2 className="text-xl font-bold text-[#66220B] mb-4 text-center">Memory Match</h2>
          <p className="text-gray-600 mb-4 text-center">Test your memory skills by matching pairs of cards.</p>
          <div className="flex justify-center">
            <span className="mt-4 text-[#F09000] font-semibold">Coming Soon</span>
          </div>
        </div>
        
        <div className="game-card bg-white rounded-xl shadow-lg p-6 opacity-60 cursor-not-allowed">
          <div className="icon flex justify-center mb-4">
            <i className="fa fa-clock-o text-4xl text-[#F09000]"></i>
          </div>
          <h2 className="text-xl font-bold text-[#66220B] mb-4 text-center">Reaction Timer</h2>
          <p className="text-gray-600 mb-4 text-center">Measure reaction time and focus with this simple test.</p>
          <div className="flex justify-center">
            <span className="mt-4 text-[#F09000] font-semibold">Coming Soon</span>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-[#66220B] text-lg mb-4">
          These games are designed to help assess cognitive skills while being fun to play!
        </p>
        <p className="text-gray-600">
          More games will be added regularly. Check back soon!
        </p>
      </div>
    </div>
  );
};

export default Games;