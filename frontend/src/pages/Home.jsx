<<<<<<< HEAD
// Home.jsx
import React, { useEffect, useState } from "react";
import { CssBaseline, Box, IconButton, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AboutUs from "../pages/AboutUs.jsx";
=======
import React, { useEffect, useState } from "react";
import { CssBaseline, Box, IconButton, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AboutUs from "./AboutUs.jsx";
>>>>>>> main

const Home = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  return (
    <div
<<<<<<< HEAD
      style={{
        backgroundColor: "#F9F0D0",
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        padding: 0,
        position: "relative",
        left: 0,
        right: 0,
        overflowX: "hidden"
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
=======
      style={{  
        backgroundColor: "#F9F0D0",
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
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
>>>>>>> main
        }}
      >
        <CssBaseline />
        <Collapse in={checked} timeout={1000} collapsedHeight={50}>
          <Box
            sx={{
              width: "100%",
<<<<<<< HEAD
=======
              height: "100vh",
>>>>>>> main
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
<<<<<<< HEAD
=======
              transition: "all 0.5s ease",
>>>>>>> main
            }}
          >
            <img
              src="https://vincentgarreau.com/particles.js/assets/img/kbLd9vb_new.gif"
              style={{
<<<<<<< HEAD
                width: "auto",
                height: "auto",
                objectFit: "contain",
                maxWidth: "1200px",
=======
                width: "100%",
                height: "auto",
                objectFit: "contain",
                maxWidth: "100%",
>>>>>>> main
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
<<<<<<< HEAD
            <IconButton
              sx={{
                animation: "bounce 2s infinite",
                marginBottom: "2rem",
              }}
            >
=======
            <IconButton sx={{ animation: "bounce 2s infinite" }}>
>>>>>>> main
              <ExpandMoreIcon sx={{ color: "#66220B", fontSize: "2rem" }} />
            </IconButton>
          </Box>
        </Collapse>
      </Box>

<<<<<<< HEAD
      <AboutUs />
=======
      {/* about Us Section */}
      <Box
        sx={{
          width: "100%",
          marginTop: "10rem",
          // paddingTop: "10rem",
          paddingTop: "2rem"
        }}
      >
       <AboutUs />
      </Box>
>>>>>>> main
    </div>
  );
};

<<<<<<< HEAD
export default Home;
=======
export default Home;
>>>>>>> main
