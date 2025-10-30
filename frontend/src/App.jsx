import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

// Pages and components
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import BubbleCursor from "./components/BubbleCursor";
import SignIn from "./pages/SignIn/SignIn.jsx";
import SignUp from "./pages/SignUp/SignUp.jsx";
import Games from "./pages/games/Games.jsx";
import SeguinGame from "./pages/games/SeguinGame.jsx";
import MonkeyType from "./pages/games/MonkeyType.jsx";
import Settings from "./components/settings.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Jigsaw puzzle routes
import Jigsaw_6_to_8 from "./components/games/jigsaw/Jigsaw_6_to_8.jsx";
import Jigsaw_8_to_10 from "./components/games/jigsaw/Jigsaw_8_to_10.jsx";
import Jigsaw_10_to_12 from "./components/games/jigsaw/Jigsaw_10_to_12.jsx";
import Jigsaw_12_to_14 from "./components/games/jigsaw/Jigsaw_12_to_14.jsx";
import MathsPuzzle from "./components/games/jigsaw/MathsPuzzle.jsx";
import JigsawHome from "./components/games/jigsaw/JigsawHome.jsx";
import JigsawGamePage from "./pages/games/JigsawGamePage.jsx";

// Analysis and test routes
import AutismAnalysis from "./components/ParentFriendlyAnalysis.jsx";
import DyslexiaTest from "./pages/DyslexiaTest";

function App() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <BrowserRouter>
        <div className="flex flex-col flex-1">
          <Navbar />
          <BubbleCursor />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />

              {/* Protected Dyslexia Test */}
              <Route
                path="/dyslexia"
                element={
                  <ProtectedRoute>
                    <DyslexiaTest />
                  </ProtectedRoute>
                }
              />

              {/* Protected Game Routes */}
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
              <Route
                path="/games/jigsaw_6_to_8"
                element={
                  <ProtectedRoute>
                    <Jigsaw_6_to_8 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/jigsaw_8_to_10"
                element={
                  <ProtectedRoute>
                    <Jigsaw_8_to_10 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/jigsaw_10_to_12"
                element={
                  <ProtectedRoute>
                    <Jigsaw_10_to_12 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/jigsaw_12_to_14"
                element={
                  <ProtectedRoute>
                    <Jigsaw_12_to_14 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/maths_puzzle"
                element={
                  <ProtectedRoute>
                    <MathsPuzzle />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/jigsaw"
                element={
                  <ProtectedRoute>
                    <JigsawHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jigsaw/jigsawstart"
                element={
                  <ProtectedRoute>
                    <JigsawGamePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Settings & Analysis */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/autism-analysis"
                element={
                  <ProtectedRoute>
                    <AutismAnalysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dyslexia"
                element={
                  <ProtectedRoute>
                    <DyslexiaTest />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <Footer className="mt-auto" />
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;