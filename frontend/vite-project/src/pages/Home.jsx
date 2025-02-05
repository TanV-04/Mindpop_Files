import React, { useEffect, useState } from "react";
import { CssBaseline, Box, IconButton, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AboutUs from "./AboutUs";

const Home = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  return (
    <div
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
      {/* Static Header Section */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <CssBaseline />
        <Collapse in={checked} timeout={1000} collapsedHeight={50}>
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
        }}
      >
        <AboutUs />
      </Box>
    </div>
  );
};

export default Home;
