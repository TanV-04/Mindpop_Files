import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Import in your App.jsx or index.js
import "react-toastify/dist/ReactToastify.css";
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
import Settings from "./components/settings.jsx";
import Jigsaw_6_to_8 from "./components/games/jigsaw/Jigsaw_6_to_8.jsx";
import Jigsaw_8_to_10 from "./components/games/jigsaw/Jigsaw_8_to_10.jsx";
import Jigsaw_10_to_12 from "./components/games/jigsaw/Jigsaw_10_to_12.jsx";
import Jigsaw_12_to_14 from "./components/games/jigsaw/Jigsaw_12_to_14.jsx";
import MathsPuzzle from "./components/games/jigsaw/MathsPuzzle.jsx";
import Footer from "./components/Footer.jsx";
import JigsawHome from "./components/games/jigsaw/JigsawHome.jsx";
import JigsawGamePage from "./pages/games/JigsawGamePage.jsx";
//import MonkeyTypeComponent from "./components/games/monkeytype/MonkeyTypeComponent.jsx";


//import MonkeyTypeComponent from "./components/games/monkeytype/MonkeyTypeComponent.jsx";

function App() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <BrowserRouter>
        <div className="flex flex-col flex-1">
          {" "}
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

              {/* <Route path="/games/monkeytype/5-7" element={<MonkeyType5to7 />} />
            <Route path="/games/monkeytype/8-10" element={<MonkeyType8to10 />} />
            <Route path="/games/monkeytype/11-12" element={<MonkeyType11to12 />} /> */}

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
              element={<ProtectedRoute><JigsawHome/></ProtectedRoute>}/>
              <Route
              path="/jigsaw/jigsawstart"
              element={<ProtectedRoute><JigsawGamePage/></ProtectedRoute>}/>

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
          <Footer className = "mt-auto" />
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
