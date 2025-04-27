import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Container,
  Grid,
  useMediaQuery,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { motion } from "framer-motion";

const Footer = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#66220B",
        color: "#F9F0D0",
        py: 1.5, // Reduced padding (was 3)
        width: "100%",
        // mt: "auto",
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={2} // Reduced spacing (was 3)
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Logo and tagline */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ textAlign: isMobile ? "center" : "left" }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                variant="h6" // Reduced from h5
                sx={{ fontWeight: "bold", fontFamily: "Quicksand" }}
              >
                Mindpop
              </Typography>
            </motion.div>
          </Grid>

          {/* Quick links */}
          <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Typography
                  variant="body2"
                  component="a"
                  href="#header"
                  sx={{
                    color: "#F9F0D0",
                    textDecoration: "none",
                  }}
                >
                  Home
                </Typography>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Typography
                  variant="body2"
                  component="a"
                  href="#about-section"
                  sx={{
                    color: "#F9F0D0",
                    textDecoration: "none",
                  }}
                >
                  About
                </Typography>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{
                    color: "#F9F0D0",
                    textDecoration: "none",
                  }}
                >
                  Contact
                </Typography>
              </motion.div>
            </Box>
          </Grid>

          {/* Social icons */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ textAlign: isMobile ? "center" : "right" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: isMobile ? "center" : "flex-end",
                gap: 1,
              }}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                <IconButton
                  size="small"
                  aria-label="facebook"
                  sx={{ color: "#F9F0D0" }}
                >
                  {" "}
                  {/* Added size="small" */}
                  <FacebookIcon fontSize="small" />{" "}
                  {/* Added fontSize="small" */}
                </IconButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.2, rotate: -10 }}
                transition={{ duration: 0.2 }}
              >
                <IconButton
                  size="small"
                  aria-label="twitter"
                  sx={{ color: "#F9F0D0" }}
                >
                  <TwitterIcon fontSize="small" />
                </IconButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                <IconButton
                  size="small"
                  aria-label="instagram"
                  sx={{ color: "#F9F0D0" }}
                >
                  <InstagramIcon fontSize="small" />
                </IconButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.2, rotate: -10 }}
                transition={{ duration: 0.2 }}
              >
                <IconButton
                  size="small"
                  aria-label="linkedin"
                  sx={{ color: "#F9F0D0" }}
                >
                  <LinkedInIcon fontSize="small" />
                </IconButton>
              </motion.div>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            borderTop: "1px solid rgba(249, 240, 208, 0.2)",
            mt: 1.5, // Reduced margin (was 3)
            pt: 1, // Reduced padding (was 2)
            textAlign: "center",
          }}
        >
          <Typography variant="body1" sx={{ fontSize: "0.8rem" }}>
            © {currentYear} Mindpop
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
