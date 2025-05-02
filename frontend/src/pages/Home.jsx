import React, { useEffect, useState } from "react";
import { CssBaseline, Box, IconButton, Collapse, useMediaQuery } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AboutUs from "../pages/AboutUs.jsx";
import { motion } from "framer-motion";

const Home = () => {
  const [checked, setChecked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

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
        overflowX: "hidden",
      }}
      id="header"
    >
      {/* Hero Section */}
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <CssBaseline />
        <Collapse in={checked} timeout={1000} collapsedHeight={50}>
          <Box
            sx={{
              width: "100%",
              height: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Animated Image (Right Half on Mobile) */}
            <img
              src="https://vincentgarreau.com/particles.js/assets/img/kbLd9vb_new.gif"
              style={{
                width: isMobile ? "250%" : "75%", 
                height: "auto",
                objectFit: "contain",
                maxWidth: isMobile ? "140vw" : "90vw", 
                marginTop: isMobile ? "-40vh" : "5vh", 
                position: isMobile ? "absolute" : "static",
                right: isMobile ? "-10vw" : "auto", 
                clipPath: isMobile ? "inset(0 0 0 50%)" : "none", 
              }}
              alt="Animated particles"
            />

            {/* Animated Mindpop Text */}
            <motion.h1
              className="quicksand font-bold uppercase tracking-wider mb-5"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
              whileTap={{ scale: 1.2 }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                fontSize: isMobile ? "3rem" : "6rem",
                color: "#66220B",
                textAlign: "center",
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              {isHovered
                ? "Mindpop".split("").map((letter, index) => (
                    <motion.span
                      key={index}
                      initial={{ y: 0 }}
                      animate={{ y: [-10, 0] }}
                      whileTap={{ scale: 1.5 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                      }}
                      style={{
                        display: "inline-block",
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))
                : "Mindpop"}
            </motion.h1>

            {/* Bounce Arrow */}
            <IconButton
              sx={{
                animation: "bounce 2s infinite",
                marginBottom: "2rem",
              }}
            >
              <ExpandMoreIcon sx={{ color: "#66220B", fontSize: isMobile ? "1.5rem" : "2rem" }} />
            </IconButton>
          </Box>
        </Collapse>
      </Box>

      {/* About Section */}
      <div id="about-section">
        <AboutUs />
      </div>
    </div>
  );
};

export default Home;