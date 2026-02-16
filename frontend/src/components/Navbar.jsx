// frontend/src/components/Navbar.jsx
// Removed: ANALYSIS and DYSLEXIA tabs (out of scope)
// Added:   Admin-aware routing (shows ADMIN DASHBOARD for admin users)
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/brain_logo.png';
import '../styles/Navbar.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// ─── Tab list per role ────────────────────────────────────────────────
const CHILD_TABS  = ['HOME', 'ABOUT', 'GAMES', 'SETTINGS'];
const ADMIN_TABS  = ['HOME', 'ADMIN'];

const Navbar = () => {
  const [activeTab,  setActiveTab]  = useState('HOME');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin,    setIsAdmin]    = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  // Sync auth state
  const syncAuth = () => {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || '{}');
    setIsLoggedIn(!!token);
    setIsAdmin(!!user.isAdmin);
  };

  useEffect(() => {
    syncAuth();
    // Update active tab based on route
    const p = location.pathname;
    if (p === '/')                   setActiveTab('HOME');
    else if (p === '/admin')          setActiveTab('ADMIN');
    else if (p.startsWith('/games')) setActiveTab('GAMES');
    else if (p === '/settings')      setActiveTab('SETTINGS');
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth-change', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-change', syncAuth);
    };
  }, []);

  const tabs = isAdmin ? ADMIN_TABS : CHILD_TABS;

  const handleTabClick = (tab) => {
    setIsMenuOpen(false);

    if (tab === 'HOME') {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (tab === 'ABOUT') {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tab === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate(`/${tab.toLowerCase()}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
    window.dispatchEvent(new Event('auth-change'));
    setIsMenuOpen(false);
  };

  return (
    <div
      style={{ backgroundColor: '#f09000' }}
      className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-3 md:py-4 shadow-xl"
    >
      <div className="max-w-9xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/">
            <img src={logo} alt="Mindpop Logo" className="h-8 md:h-12 w-auto cursor-pointer" />
          </Link>
          <span className="text-[#66220B] font-bold quicksand text-lg md:text-xl">Mindpop</span>
        </div>

        {/* Hamburger */}
        <button className="hamburger-btn md:hidden flex flex-col justify-center items-center" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`} />
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex flex-1 justify-center bg-transparent quicksand">
          <SlideTabs activeTab={activeTab} onTabClick={handleTabClick} tabs={tabs} />
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex gap-3 quicksand">
          {isLoggedIn ? (
            <button className="groups" onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/sign-in"><button className="groups">Sign In</button></Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        className="md:hidden w-full bg-[#f09000] overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: isMenuOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 flex flex-col items-center gap-4">
          <div className="flex flex-col w-full items-center gap-3 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-6 py-2 w-full text-center rounded-full text-base quicksand ${
                  activeTab === tab ? 'bg-[#66220B] text-white' : 'text-[#66220B] hover:bg-[#66220B] hover:bg-opacity-10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="w-full flex justify-center quicksand">
            {isLoggedIn ? (
              <button className="groups w-full" onClick={handleLogout}>Logout</button>
            ) : (
              <Link to="/sign-in" className="w-full"><button className="groups w-full">Sign In</button></Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── SlideTabs ────────────────────────────────────────────────────────
const SlideTabs = ({ activeTab, onTabClick, tabs }) => {
  const [hoverPosition, setHoverPosition] = useState({ left: 0, width: 0, opacity: 0 });

  return (
    <nav
      onMouseLeave={() => setHoverPosition((prev) => ({ ...prev, opacity: 0 }))}
      className="relative flex items-center border-2 rounded-full px-1 py-1 bg-transparent"
    >
      {tabs.map((tab) => (
        <Tab key={tab} isActive={activeTab === tab} onClick={() => onTabClick(tab)} setHoverPosition={setHoverPosition}>
          {tab}
        </Tab>
      ))}
      <motion.div
        animate={hoverPosition}
        initial={false}
        className="absolute z-0 rounded-full transition-opacity duration-200"
        style={{ backgroundColor: '#66220B', height: '85%' }}
      />
    </nav>
  );
};

const Tab = ({ children, setHoverPosition, isActive, onClick }) => {
  const ref = useRef(null);
  return (
    <button
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setHoverPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      onClick={onClick}
      className={`relative z-10 px-3 sm:px-4 md:px-6 py-2 text-sm md:text-base font-['Quicksand'] transition-colors duration-200 whitespace-nowrap rounded-full ${
        isActive ? 'text-white' : 'text-[#66220B]'
      }`}
    >
      {children}
    </button>
  );
};

export default Navbar;
