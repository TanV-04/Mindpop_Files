import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Import in your App.jsx or index.js
import 'react-toastify/dist/ReactToastify.css';
// import pages and components
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import BubbleCursor from "./components/BubbleCursor";
import SignIn from "./pages/SignIn/SignIn.jsx";
import SignUp from "./pages/SignUp/SignUp.jsx";
import Games from "./pages/games/Games.jsx";
import SeguinGame from "./pages/games/SeguinGame.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MonkeyType from "./pages/games/MonkeyType.jsx";
import Settings from "./components/settings.jsx"; // Import the Settings component


import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <BrowserRouter>
        <Navbar />
        <BubbleCursor />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />

            {/* Protected routes for games */}
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <Games />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/seguin-board"
              element={
                <ProtectedRoute>
                  <SeguinGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/monkeytype"
              element={
                <ProtectedRoute>
                  <MonkeyType />
                </ProtectedRoute>
              }
            />
            
            {/* Add the route for Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;