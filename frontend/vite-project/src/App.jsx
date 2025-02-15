import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// import pages and components
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import BubbleCursor from "./components/BubbleCursor";
import SignIn from "./pages/SignIn/SignIn.jsx";
import SignUp from "./pages/SignUp/SignUp.jsx";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <BrowserRouter>
        <BubbleCursor />
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path = "/sign-in" element = {<SignIn />}/>
            <Route path="/sign-up" element = {<SignUp />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
