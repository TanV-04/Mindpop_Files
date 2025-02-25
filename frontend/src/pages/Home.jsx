import { useEffect, useState } from "react";
import { CssBaseline, Box, IconButton, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AboutUs from "./AboutUs.jsx";

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
          <Box
            sx={{
              width: "100%",
              height: "100vh",
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
                width: "100%",
                height: "auto",
                objectFit: "contain",
                maxWidth: "100%",
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
            <IconButton sx={{ animation: "bounce 2s infinite" }}>
              <ExpandMoreIcon sx={{ color: "#66220B", fontSize: "2rem" }} />
            </IconButton>
          </Box>
        </Collapse>
      </Box>

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
    </div>
  );
};

export default Home;
