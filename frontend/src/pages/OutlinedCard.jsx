import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Collapse, useMediaQuery } from "@mui/material";

export default function OutlinedCard({ checked }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Collapse in={checked} {...(checked ? { timeout: 1000 } : {})}>
      <Card
        sx={{
          maxWidth: 900,
          backgroundColor: "transparent",
          border: "1px solid #66220B",
          borderRadius: "16px",
          boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.25)",
        }}
      >
        <CardContent sx={{ padding: isMobile ? "16px" : "24px" }}>
          <Typography
            gutterBottom
            sx={{
              fontFamily: "Quicksand, sans-serif",
              fontWeight: "bold",
              color: "#66220B",
              fontSize: isMobile ? "1.5rem" : "2rem",
              lineHeight: "1.4",
            }}
            variant="h9"
            component="div"
          >
            About Us
          </Typography>
          <Typography
            sx={{
              fontFamily: "Quicksand",
              color: "#66220B",
              fontSize: isMobile ? "1rem" : "1.3rem",
              lineHeight: "1.8",
              maxWidth: "950px",
              margin: "0 auto",
            }}
          >
            MindPop is a gamified learning platform designed for kids with ADHD. We make learning fun and flexible through interactive games that adapt to each child&apos;s focus, pace, and progress. By tracking engagement and attention, we personalize content to help kids stay motivated and succeed on their own terms.
          </Typography>
        </CardContent>
      </Card>
    </Collapse>
  );
}