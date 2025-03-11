import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "../assets/brain_logo.png";
import "../styles/Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("HOME");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
    setIsMenuOpen(false);
  };

  const location = useLocation();

  const handleTabClick = (tab) => {
    if (tab === "HOME") {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (tab === "ABOUT") {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const aboutSection = document.getElementById("about-section");
          if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        const aboutSection = document.getElementById("about-section");
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      navigate(`/${tab.toLowerCase()}`);
    }
  };
  // Toggle menu for mobile
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div
      style={{ backgroundColor: "#f09000" }}
      className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-3 md:py-4 shadow-xl"
    >
      <div className="max-w-9xl mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/">
            <img
              src={logo}
              alt="Mindpop Logo"
              className="h-8 md:h-12 w-auto cursor-pointer"
            />
          </Link>

          <span className="text-[#66220B] font-bold quicksand text-lg md:text-xl">
            Mindpop
          </span>
        </div>

        {/* Hamburger Menu Button - Only visible on mobile */}
        <button
          className="hamburger-btn md:hidden flex flex-col justify-center items-center"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center bg-transparent quicksand">
          <SlideTabs activeTab={activeTab} onTabClick={handleTabClick} />
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex gap-3 quicksand">
          {isLoggedIn ? (
            <button className="groups" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/sign-in">
              <button className="groups">Sign In</button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu - Slides down when hamburger is clicked */}
      <motion.div
        className="md:hidden w-full bg-[#f09000] overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: isMenuOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 flex flex-col items-center gap-4">
          {/* Mobile Navigation Links */}
          <div className="flex flex-col w-full items-center gap-3 mb-4">
            {["HOME", "ABOUT", "GAMES", "SETTINGS"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-6 py-2 w-full text-center rounded-full text-base quicksand 
                  ${
                    activeTab === tab
                      ? "bg-[#66220B] text-white"
                      : "text-[#66220B] hover:bg-[#66220B] hover:bg-opacity-10"
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile Auth Button */}
          <div className="w-full flex justify-center quicksand">
            {isLoggedIn ? (
              <button className="groups w-full" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <Link to="/sign-in" className="w-full">
                <button className="groups w-full">Sign In</button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SlideTabs = ({ activeTab, onTabClick }) => {
  const [hoverPosition, setHoverPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const tabs = ["HOME", "ABOUT", "GAMES", "SETTINGS"];

  return (
    <nav
      onMouseLeave={() => {
        setHoverPosition((prev) => ({ ...prev, opacity: 0 }));
      }}
      className="relative flex items-center border-2 rounded-full px-1 py-1 bg-transparent"
    >
      {tabs.map((tab) => (
        <Tab
          key={tab}
          isActive={activeTab === tab}
          onClick={() => onTabClick(tab)}
          setHoverPosition={setHoverPosition}
        >
          {tab}
        </Tab>
      ))}
      <motion.div
        animate={hoverPosition}
        initial={false}
        className="absolute z-0 rounded-full transition-opacity duration-200"
        style={{ backgroundColor: "#66220B", height: "85%" }}
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
        setHoverPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      onClick={onClick}
      className={`
        relative z-10 px-3 sm:px-4 md:px-6 py-2 text-sm md:text-base font-['Quicksand'] transition-colors
        duration-200 text-[#F09000] whitespace-nowrap rounded-full
        ${
          isActive
            ? "bg-transparent text-white"
            : "hover: text-wheat rounded-full"
        }
      `}
    >
      {children}
    </button>
  );
};

export default Navbar;
