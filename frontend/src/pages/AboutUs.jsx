import { Box } from "@mui/material";
//import React from "react";
import OutlinedCard from "./OutlinedCard.jsx";
import useWindowPosition from "../hooks/useWindowPosition.js";
import testImg from "/src/assets/adhd_img.png"

const AboutUs = () => {
  const checked = useWindowPosition("header"); // get scroll position state

  return (
    <div
      style={{
        backgroundColor: "#F9F0D0",
        minHeight: "100vh",
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
        overflow: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, 
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "1200px",
          padding: { xs: "1rem", sm: "2rem", md: "2rem" },
        }}
      >
        {/* Left Side (Text) */}
        <Box
          sx={{
            flex: 1,
            paddingRight: { md: "2rem" }, 
            marginBottom: { xs: "2rem", md: 0 }, 
          }}
        >
          <OutlinedCard checked={checked} />
        </Box>

        {/* Right Side (Image) */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: checked ? 1 : 0,
            transform: checked ? "scale(1)" : "scale(0.8)", 
            transition: "all 0.5s ease-in-out",
          }}
        >
          <img
            src={testImg} 
            alt="About Us"
            style={{
              width: "100%",
              borderRadius: "5%",
              height: "auto",
              objectFit: "contain",
              maxWidth: "400px", 
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.7)"
            }}
          />
        </Box>
      </Box>
    </div>
  );
};

export default AboutUs;
