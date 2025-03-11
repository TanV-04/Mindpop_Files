
import React, { useEffect, useState } from "react";

import { CssBaseline, Box, IconButton, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AboutUs from "../pages/AboutUs.jsx";

const Home = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  return (
    <div
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
        }}
      >
        <CssBaseline />
        <Collapse in={checked} timeout={1000} collapsedHeight={50}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="https://vincentgarreau.com/particles.js/assets/img/kbLd9vb_new.gif"
              style={{
                width: "100%", // made the cat gif more responsive
                height: "auto",
                objectFit: "contain",
                maxWidth: "1200px",
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
              }}
            >
              <ExpandMoreIcon sx={{ color: "#66220B", fontSize: "2rem" }} />
            </IconButton>
          </Box>
        </Collapse>
      </Box>

      <AboutUs />
    </div>
  );
};

export default Home;
