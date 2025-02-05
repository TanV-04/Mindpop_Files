import { Box } from "@mui/material";
import React from "react";
import OutlinedCard from "./OutlinedCard";
import useWindowPosition from "../hooks/useWindowPosition.js";

const AboutUs = () => {
  const checked = useWindowPosition('header');
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
      }}
    >
      <Box sx={{marginTop: "5"}}>
        <OutlinedCard checked={checked} />
      </Box>
    </div>
  );
};

export default AboutUs;
