import React from "react";
import { IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const RestartButton = ({ onRestart }) => {
  return (
    <div className="mt-10 text-center">
      <IconButton onClick={onRestart} color="primary" aria-label="restart">
        <RefreshIcon />
      </IconButton>
    </div>
  );
};

export default RestartButton;

// kept global so that it can be used throughout the organization