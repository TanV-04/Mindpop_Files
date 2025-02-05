import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// import pages and components
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import FooterForPage from "./components/FooterForPage";

function App() {

  return (
    <div className="min-h-screen flex flex-col">
      <BrowserRouter>
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <Home />
              }
            />
          </Routes>
        </div>
        {/* <FooterForPage /> */}
      </BrowserRouter>
    </div>
  );
}

export default App;
