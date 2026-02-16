// frontend/src/pages/games/Games.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Games.css';

const MONKEY_TYPE_MIN_AGE = 12;

const Games = () => {
  // Read age from localStorage (set at login)
  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const userAge = user.age || 0;

  const gameCards = [
    {
      id:          'seguin-board',
      title:       'Shape Matcher',
      subtitle:    'Seguin Form Board',
      icon:        '🔷',
      emoji:       '🎯',
      description: 'Match colorful shapes to their spots! Train your brain!',
      path:        '/games/seguin-board',
      available:   true,
    },
    {
      id:          'jigsaw',
      title:       'Puzzle Master',
      subtitle:    'Jigsaw Puzzles',
      icon:        '🧩',
      emoji:       '🖼️',
      description: 'Piece together amazing puzzles! Fun for everyone!',
      path:        '/games/jigsaw',
      available:   true,
    },
    {
      id:          'balloon',
      title:       'Balloon Pop',
      subtitle:    'Hand-Eye Game',
      icon:        '🎈',
      emoji:       '💥',
      description: 'Pop colorful balloons before they float away! Fun & fast!',
      path:        '/games/balloon-pop',
      available:   true,
    },
    {
      id:          'monkeytype',
      title:       'Speed Typer',
      subtitle:    'Typing Challenge',
      icon:        '⌨️',
      emoji:       '🐒',
      description: `How fast can you type? Beat your high score! (Ages ${MONKEY_TYPE_MIN_AGE}+)`,
      path:        '/games/monkeytype',
      available:   userAge >= MONKEY_TYPE_MIN_AGE,
      lockedMsg:   `Available for ages ${MONKEY_TYPE_MIN_AGE}+`,
    },
  ];

  const settings = {
    dots:           true,
    infinite:       true,
    speed:          500,
    slidesToShow:   3,
    slidesToScroll: 1,
    autoplay:       false,
    arrows:         true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 640,  settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false } },
    ],
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: 'rgb(249, 240, 208)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 quicksand" style={{ color: '#66220B' }}>
            Let&apos;s Play &amp; Learn!
          </h1>
          <div className="w-32 h-2 bg-gradient-to-r from-[#F09000] to-[#FF9F1C] mx-auto rounded-full mb-6" />
          <p className="text-xl md:text-2xl font-semibold max-w-3xl mx-auto" style={{ color: '#66220B' }}>
            Pick a game and start your awesome adventure!
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="games-carousel-container">
          <Slider {...settings}>
            {gameCards.map((game) => (
              <div key={game.id} className="carousel-slide">
                {game.available ? (
                  <Link to={game.path} className="block group no-underline" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <GameCard game={game} />
                  </Link>
                ) : (
                  <LockedCard game={game} />
                )}
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

// ── Available game card ───────────────────────────────────────────────
const GameCard = ({ game }) => (
  <div className="game-card-wrapper">
    <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full border-4 border-[#F09000] hover:border-[#66220B] transform hover:-translate-y-2">
      <div className="h-3 bg-gradient-to-r from-[#F09000] to-[#FF9F1C]" />
      <div className="p-8">
        <div className="flex justify-center mb-6">
          <div className="text-8xl transform group-hover:scale-110 transition-transform duration-300">
            {game.icon}
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-center quicksand" style={{ color: '#66220B' }}>
          {game.title}
        </h2>
        <p className="text-lg font-semibold text-center mb-4" style={{ color: '#66220B' }}>
          {game.subtitle}
        </p>
        <p className="text-lg text-center mb-6 leading-relaxed" style={{ color: '#66220B' }}>
          {game.description}
        </p>
        <div className="flex justify-center">
          <button className="bg-gradient-to-r from-[#F09000] to-[#FF9F1C] text-black font-bold text-xl py-4 px-10 rounded-full shadow-lg hover:shadow-xl transform group-hover:scale-105 transition-all duration-300 flex items-center gap-3">
            <span>Play Now!</span>
            <span className="text-2xl">{game.emoji}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Age-locked game card ──────────────────────────────────────────────
const LockedCard = ({ game }) => (
  <div className="game-card-wrapper">
    <div className="relative bg-white rounded-3xl shadow-md overflow-hidden h-full border-4 border-[#F09000] opacity-80">
      <div className="h-3 bg-gradient-to-r from-[#F09000] to-[#FF9F1C]" />
      <div className="p-8">
        <div className="flex justify-center mb-6">
          <div className="text-8xl grayscale">{game.icon}</div>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-center quicksand" style={{ color: '#66220B' }}>
          {game.title}
        </h2>
        <p className="text-lg font-semibold text-center mb-4" style={{ color: '#66220B' }}>
          {game.subtitle}
        </p>
        <p className="text-lg text-center mb-6" style={{ color: '#66220B' }}>
          {game.description}
        </p>
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">🔒</span>
            <span className="bg-[#F09000] text-white font-bold text-base py-3 px-8 rounded-full cursor-not-allowed opacity-90">
              {game.lockedMsg || 'Age Restricted'}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Games;
