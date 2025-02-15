import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Collapse } from "@mui/material";

export default function OutlinedCard({ checked }) {
  return (
    <Collapse in={checked} {...(checked ? { timeout: 1000 } : {})}>
      <Card
        sx={{
          maxWidth: 900, 
          backgroundColor: "transparent",
          border: "1px solid #66220B",
          borderRadius: "16px", 
          // margin: "30px",
          boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.25)", 
        }}
      >
        <CardContent sx={{ padding: "24px" }}>
          <Typography
            gutterBottom
            sx={{
              fontFamily: "Quicksand, sans-serif", 
              fontWeight: "bold",
              color: "#66220B",
              fontSize: "2rem", 
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
              fontSize: "1.37rem", 
              lineHeight: "1.8",
              maxWidth: "950px",
              margin: "0 auto", 
            }}
          >
            We’re a gamified learning platform for kids with ADHD, helping them
            build problem-solving and academic skills in a fun, personalized
            way. Each game is tailored to their unique needs, allowing them to
            learn at their own pace. We track progress through their <span className="font-bold">EAR </span>
            (Engagement, Attention, and Retention) ratio and attention span,
            using the device’s camera, all aimed at improving focus and
            learning.
          </Typography>
        </CardContent>
      </Card>
    </Collapse>
  );
}
