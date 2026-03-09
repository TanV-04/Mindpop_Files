// frontend/src/App.jsx
import './index.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';

import Home           from './pages/Home';
import Navbar         from './components/Navbar';
import BubbleCursor   from './components/BubbleCursor';
import SignIn         from './pages/SignIn/SignIn.jsx';
import SignUp         from './pages/SignUp/SignUp.jsx';
import Games          from './pages/games/Games.jsx';
import SeguinGame     from './pages/games/SeguinGame.jsx';
import MonkeyType     from './pages/games/MonkeyType.jsx';
import Settings       from './components/settings.jsx';
import Footer         from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BalloonPop     from './pages/games/BalloonPop.jsx';
import JigsawGame     from './components/games/jigsaw/jigsawGame.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminRoute     from './components/AdminRoute.jsx';

// ─── Scroll to top BEFORE paint ──────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
};

// ─── Cream background wrapper for all game pages ─────────────────────
// Ensures the page background is always MindPop cream (#F9F0D0) the
// instant a game route mounts, before the game's own CSS has loaded.
// This prevents the white-flash on navigation to any game.
const GamePageWrapper = ({ children }) => (
  <div className="min-h-screen" style={{ backgroundColor: 'rgb(249, 240, 208)' }}>
    {children}
  </div>
);

// ─── Bubble cursor hidden on all game pages ───────────────────────────
const GAME_PATHS = [
  '/games/seguin-board',
  '/games/monkeytype',
  '/games/jigsaw',
  '/games/balloon-pop',
];

const ConditionalBubbleCursor = () => {
  const { pathname } = useLocation();
  if (GAME_PATHS.some((p) => pathname.startsWith(p))) return null;
  return <BubbleCursor />;
};

function App() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex flex-col flex-1">
          <Navbar />
          {/* <ConditionalBubbleCursor /> */}
          <div className="flex-1 pt-16">
            <Routes>
              {/* ── Public ──────────────────────────────────── */}
              <Route path="/"        element={<Home />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />

              {/* ── Games (all wrapped in GamePageWrapper) ── */}
              <Route path="/games" element={
                <ProtectedRoute><Games /></ProtectedRoute>
              } />
              <Route path="/games/seguin-board" element={
                <ProtectedRoute>
                  <GamePageWrapper><SeguinGame /></GamePageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/games/monkeytype" element={
                <ProtectedRoute>
                  <GamePageWrapper><MonkeyType /></GamePageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/games/jigsaw" element={
                <ProtectedRoute>
                  <GamePageWrapper><JigsawGame /></GamePageWrapper>
                </ProtectedRoute>
              } />
              <Route path="/games/balloon-pop" element={
                <ProtectedRoute>
                  <GamePageWrapper><BalloonPop /></GamePageWrapper>
                </ProtectedRoute>
              } />

              {/* ── Settings ────────────────────────────────── */}
              <Route path="/settings" element={
                <ProtectedRoute><Settings /></ProtectedRoute>
              } />

              {/* ── Admin ───────────────────────────────────── */}
              <Route path="/admin" element={
                <AdminRoute><AdminDashboard /></AdminRoute>
              } />
            </Routes>
          </div>
          <Footer className="mt-auto" />
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;