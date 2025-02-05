import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Slide,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import "../styles/Navbar.css";
import logo from "/src/assets/brain_logo.png";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // function to update the active tab on click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (drawerOpen) {
      setDrawerOpen(false); //close the drawer when a tab is clicked
    }
  };

  useEffect(() => {
    const path = window.location.pathname.split("/").pop();

    if (path === "") {
      setActiveTab("Home");
    } else {
      setActiveTab(path);
    }
  }, []);

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const menuItems = ["Home", "About"];
  const authItems = ["Sign Up", "Login"];

  return (
    <div>
      <Slide direction="down" in={true} mountOnEnter unmountOnExit>
        <AppBar position="fixed" sx={{ backgroundColor: "#F09000" }}>
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="logo"
              sx={{ fontFamily: "Quicksand, sans-serif" }}
            >
              {/* logo */}
              <img src={logo} className="h-8 sm:h-10 md:h-12 w-auto" />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                color: "#66220B",
                fontFamily: "Quicksand, sans-serif",
                fontWeight: "bold",
              }}
            >
              Mindpop
            </Typography>

            {/* menu items for large screens */}
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Stack direction="row" spacing={2}>
                {menuItems.map((item) => (
                  <Button
                    key={item}
                    sx={{
                      fontFamily: "Quicksand, sans-serif",
                      color: "#66220B",
                    }}
                    color="inherit"
                    onClick={() => handleTabClick(item)}
                    className={activeTab === item ? "active" : ""}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                borderLeft: "1px solid #66220B",
                height: "33px",
                margin: "0 20px",
                display: { xs: "none", sm: "block" },
                paddingRight: 1,
              }}
            />

          
            {/* auth items for large screens */}
            <Box sx={{ display: { xs: "none", sm: "block" }, paddingRight: 2 }}>
              <Stack direction="row" spacing={2}>
                {authItems.map((item) => (
                  <Button
                    key={item}
                    sx={{
                      fontFamily: "Quicksand, sans-serif",
                      color: "#fff",
                      backgroundColor: "#66220B",
                    }}
                    color="inherit"
                    onClick={() => handleTabClick(item)}
                    className={activeTab === item ? "active" : ""}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* Menu for small screens */}
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={() => toggleDrawer(true)}
                sx={{ paddingRight: 3 }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => toggleDrawer(false)}
                sx={{ color: "#66220B" }}
              >
                <Box
                  sx={{
                    width: 250,
                    height: "100%",
                    paddingTop: 3,
                  }}
                  role="presentation"
                  onClick={() => setDrawerOpen(false)} // close the drawer when clicking on an item
                  onKeyDown={() => setDrawerOpen(false)}
                >
                  <List>
                    {[...menuItems, ...authItems].map((item) => (
                      <ListItem
                        button
                        key={item}
                        onClick={() => handleTabClick(item)}
                      >
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>

                  <Divider />
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </AppBar>
      </Slide>
    </div>
  );
};

export default Navbar;
