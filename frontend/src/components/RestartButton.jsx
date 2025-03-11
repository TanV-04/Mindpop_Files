import React from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const RestartButton = () => {
  const navigate = useNavigate();

  const handleRestart = () => {
    navigate("/games"); // Navigates back to game.jsx
  };

  return (
    <div className="mt-10 text-center">
      <Tooltip title="Restart">
        <IconButton onClick={handleRestart} color="primary" aria-label="Restart the game">
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default RestartButton;
