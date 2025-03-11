import { Link } from "react-router-dom";
import "../../components/games/seguin-board/styles/seguin.css";

const Games = () => {
  const gameCards = [
    {
      id: "seguin-board",
      title: "Seguin Form Board",
      icon: "fa fa-puzzle-piece",
      description: "Match shapes to their correct positions in this classic assessment tool.",
      path: "/games/seguin-board",
      available: true
    },
    {
      id: "monkeytype",
      title: "Speed Type Test",
      icon: "fa-solid fa-keyboard",
      description: "Test your typing speed and accuracy.",
      path: "/games/monkeytype",
      available: true
    },
    {
      id: "reaction-timer",
      title: "Reaction Timer",
      icon: "fa fa-clock-o",
      description: "Measure reaction time and focus with this simple test.",
      path: "/games/reaction-timer",
      available: false
    }
  ];

  return (
    <div className="games-container pt-28 px-6 min-h-screen bg-gradient-to-b from-[#F9F5EB] to-[#F3EFE5]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#66220B] mb-3 quicksand">
            Learning & Assessment Games
          </h1>
          <div className="w-24 h-1 bg-[#F09000] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Enhance cognitive skills through interactive and engaging assessment activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gameCards.map((game) => (
            game.available ? (
              <Link to={game.path} key={game.id} className="block transform hover:scale-105 transition-all duration-300 no-underline">
                <div className="game-card bg-white rounded-2xl shadow-lg p-8 h-full border-t-4 border-[#F09000] hover:shadow-xl">
                  <div className="icon flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-[#FFF6E9] flex items-center justify-center">
                      <i className={`${game.icon} text-3xl text-[#F09000]`}></i>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-[#66220B] mb-3 text-center quicksand no-underline">
                    {game.title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-center no-underline">
                    {game.description}
                  </p>
                  <div className="flex justify-center">
                    <span className="px-6 py-2 bg-[#FFF6E9] text-[#F09000] font-semibold rounded-lg hover:bg-[#F09000] hover:text-black transition-colors no-underline">
                      Start Playing →
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <div key={game.id} className="game-card bg-white rounded-2xl shadow-md p-8 h-full border-t-4 border-gray-300 opacity-70 cursor-not-allowed">
                <div className="icon flex justify-center mb-5">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <i className={`${game.icon} text-3xl text-gray-400`}></i>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-600 mb-3 text-center quicksand no-underline">
                  {game.title}
                </h2>
                <p className="text-gray-500 mb-6 text-center no-underline">
                  {game.description}
                </p>
                <div className="flex justify-center">
                  <span className="px-6 py-2 bg-gray-100 text-gray-500 font-semibold rounded-lg no-underline">
                    Coming Soon
                  </span>
                </div>
              </div>
            )
          ))}
        </div>

        <div className="mt-16 mb-8 text-center p-8 bg-white rounded-2xl shadow-md max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-[#66220B] mb-4 quicksand">Why Play Our Games?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF6E9] flex items-center justify-center mx-auto mb-3">
                <i className="fa fa-brain text-xl text-[#F09000]"></i>
              </div>
              <h4 className="font-semibold text-[#66220B] mb-1">Cognitive Development</h4>
              <p className="text-gray-600 text-sm">Enhance problem-solving and critical thinking</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF6E9] flex items-center justify-center mx-auto mb-3">
                <i className="fa fa-chart-line text-xl text-[#F09000]"></i>
              </div>
              <h4 className="font-semibold text-[#66220B] mb-1">Progress Tracking</h4>
              <p className="text-gray-600 text-sm">Monitor your improvement over time</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF6E9] flex items-center justify-center mx-auto mb-3">
                <i className="fa fa-smile text-xl text-[#F09000]"></i>
              </div>
              <h4 className="font-semibold text-[#66220B] mb-1">Fun Learning</h4>
              <p className="text-gray-600 text-sm">Engaging activities make assessment enjoyable</p>
            </div>
          </div>
          <p className="text-gray-600">
            More games will be added regularly. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Games;