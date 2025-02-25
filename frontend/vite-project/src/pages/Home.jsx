import React, { useEffect, useState } from "react";
import { CssBaseline, Box, IconButton, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
<<<<<<< Updated upstream
import AboutUs from "./AboutUs";
=======
import AboutUs from "../pages/AboutUs.jsx";
>>>>>>> Stashed changes

const Home = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#F9F0D0",
<<<<<<< Updated upstream
        minHeight: "100vh",
        height: "100vh",
        width: "100vw",
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        position: "relative",
        padding: "2rem", 
      }}
      id="header"
    >
      {/* Static Header Section */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
=======
        width: "100%",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        padding: 0,
      }}
      id="header"
    >
      {/* Hero Section */}
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
>>>>>>> Stashed changes
        }}
      >
        <CssBaseline />
        <Collapse in={checked} timeout={1000} collapsedHeight={50}>
<<<<<<< Updated upstream
          <img
            src="https://vincentgarreau.com/particles.js/assets/img/kbLd9vb_new.gif"
            style={{
              width: "800px",
              height: "auto",
              objectFit: "contain",
            }}
          />
          <Box sx={{ color: "#66220B" }}>
            <h1 className="text-center quicksand font-bold uppercase tracking-wider mb-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              Mindpop
            </h1>
          </Box>

          <IconButton sx={{ animation: "bounce 2s infinite" }}>
            <ExpandMoreIcon sx={{ color: "#66220B", fontSize: "2rem" }} />
          </IconButton>
        </Collapse>
      </Box>

      {/* about Us Section */}
      <Box
        sx={{
          width: "100%",
          marginTop: "80vh", 
          paddingTop: "10rem"
=======
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.5s ease",
            }}
          >
            <img
              src="https://vincentgarreau.com/particles.js/assets/img/kbLd9vb_new.gif"
              style={{
                width: "auto",
                height: "auto",
                objectFit: "contain",
                maxWidth: "300px", // Fixed size for the cat
              }}
            />
            <Box
              sx={{
                color: "#66220B",
                textAlign: "center",
                padding: { xs: 2, sm: 3, md: 4 },
              }}
            >
              <h1 className="quicksand font-bold uppercase tracking-wider mb-5 sm:text-7xl md:text-8xl lg:text-8xl">
                Mindpop
              </h1>
            </Box>
            <IconButton 
              sx={{ 
                animation: "bounce 2s infinite",
                marginBottom: "2rem",
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <ExpandMoreIcon sx={{ color: "#66220B", fontSize: "2rem" }} />
            </IconButton>
          </Box>
        </Collapse>
      </Box>

      {/* About Us Section */}
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#F9F0D0",
          display: "flex",
          flexDirection: "column",
          margin: 0,
          padding: 0,
>>>>>>> Stashed changes
        }}
      >
        <AboutUs />
      </Box>
    </div>
  );
};

<<<<<<< Updated upstream
export default Home;
=======
export default Home;
>>>>>>> Stashed changes
