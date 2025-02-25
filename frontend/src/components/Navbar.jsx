// import React, { useState, useEffect, useRef } from "react";
// import {
//   AppBar,
//   Toolbar,
//   IconButton,
//   Typography,
//   Stack,
//   Button,
//   Box,
//   Drawer,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
//   Slide,
// } from "@mui/material";
// import MenuIcon from "@mui/icons-material/Menu";
// import "../styles/Navbar.css";
// import logo from "/src/assets/brain_logo.png";

// const Navbar = () => {
//   const [activeTab, setActiveTab] = useState("Home");
//   const [drawerOpen, setDrawerOpen] = useState(false);

//   // function to update the active tab on click
//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//     if (drawerOpen) {
//       setDrawerOpen(false); //close the drawer when a tab is clicked
//     }
//   };

//   useEffect(() => {
//     const path = window.location.pathname.split("/").pop();

//     if (path === "") {
//       setActiveTab("Home");
//     } else {
//       setActiveTab(path);
//     }
//   }, []);

//   const toggleDrawer = (open) => {
//     setDrawerOpen(open);
//   };

//   const Cursor = () => {
//     return <li
//       className="absolute z-0 h-7 w-36 rounded-full bg-red md:h-12" />;
//   };

//   const menuItems = ["Home", "About", "Help", "Settings", "Profile"];
//   const authItems = ["Sign Up", "Login"];

//   return (
//     <div>
//       <Slide direction="down" in={true} mountOnEnter unmountOnExit>
//         <AppBar position="fixed" sx={{ backgroundColor: "#F09000" }}>
//           <Toolbar>
//             <IconButton
//               size="large"
//               edge="start"
//               color="inherit"
//               aria-label="logo"
//               sx={{ fontFamily: "Quicksand, sans-serif" }}
//             >
//               {/* logo */}
//               <img src={logo} className="h-8 sm:h-10 md:h-12 w-auto" />
//             </IconButton>
//             <Typography
//               variant="h6"
//               component="div"
//               sx={{
//                 flexGrow: 1,
//                 color: "#66220B",
//                 fontFamily: "Quicksand, sans-serif",
//                 fontWeight: "bold",
//               }}
//             >
//               Mindpop
//             </Typography>

//             {/* menu items for large screens */}
//             <Box sx={{ display: { xs: "none", sm: "block" } }}>
//               <Stack direction="row" spacing={2}
//                 sx={{
//                   border: "2px solid #66220B",
//                   borderRadius: "9999px",
//                   paddingRight: 4,
//                   position: "relative"
//                 }}>
//                 <div style={{
//                   mixBlendMode: "difference",
//                   color: "white",
//                   display: "flex",
//                   alignItems: "center",
//                   width: "100%",
//                   position: "relative",
//                   zIndex: 2
//                 }}>
//                   {menuItems.map((item) => (
//                     <Button
//                       key={item}
//                       sx={{
//                         fontFamily: "Quicksand, sans-serif",
//                         color: "#66220B",
//                         zIndex: 3,
//                       }}
//                       color="inherit"
//                       onClick={() => handleTabClick(item)}
//                       className={activeTab === item ? "active" : ""}
//                     >

//                       {item}
//                     </Button>
//                   ))}

//                 </div>
//                 <Cursor />
//               </Stack>
//             </Box>

//             <Box
//               sx={{
//                 borderLeft: "1px solid #66220B",
//                 height: "33px",
//                 margin: "0 20px",
//                 display: { xs: "none", sm: "block" },
//                 paddingRight: 1,
//                 borderRadius: "9000px"
//               }}
//             />

//             {/* auth items for large screens */}
//             <Box sx={{ display: { xs: "none", sm: "block" }, paddingRight: 2 }}>
//               <Stack direction="row" spacing={2}>
//                 {authItems.map((item) => (
//                   <Button
//                     key={item}
//                     sx={{
//                       fontFamily: "Quicksand, sans-serif",
//                       color: "#fff",
//                       backgroundColor: "#66220B",
//                     }}
//                     color="inherit"
//                     onClick={() => handleTabClick(item)}
//                     className={activeTab === item ? "active" : ""}
//                   >
//                     {item}
//                   </Button>
//                 ))}
//               </Stack>
//             </Box>

//             {/* Menu for small screens */}
//             <Box sx={{ display: { xs: "block", sm: "none" } }}>
//               <IconButton
//                 edge="end"
//                 color="inherit"
//                 aria-label="menu"
//                 onClick={() => toggleDrawer(true)}
//                 sx={{ paddingRight: 3 }}
//               >
//                 <MenuIcon />
//               </IconButton>
//               <Drawer
//                 anchor="right"
//                 open={drawerOpen}
//                 onClose={() => toggleDrawer(false)}
//                 sx={{ color: "#66220B" }}
//               >
//                 <Box
//                   sx={{
//                     width: 250,
//                     height: "100%",
//                     paddingTop: 3,
//                   }}
//                   role="presentation"
//                   onClick={() => setDrawerOpen(false)} // close the drawer when clicking on an item
//                   onKeyDown={() => setDrawerOpen(false)}
//                 >
//                   <List>
//                     {[...menuItems, ...authItems].map((item) => (
//                       <ListItem
//                         button
//                         key={item}
//                         onClick={() => handleTabClick(item)}
//                       >
//                         <ListItemText primary={item} />
//                       </ListItem>
//                     ))}
//                   </List>

//                   <Divider />
//                 </Box>
//               </Drawer>
//             </Box>
//           </Toolbar>
//         </AppBar>
//       </Slide>
//     </div>
//   );
// };

// export default Navbar;
// import React, { useState, useRef } from "react";
// import { motion } from "framer-motion";
// import logo from "../assets/brain_logo.png";
// import "../styles/Navbar.css";
// import { Link } from "react-router-dom";
// // import { Link as ScrollLink } from "react-scroll";

// const Navbar = () => {
//   const [activeTab, setActiveTab] = useState("HOME");

//   return (
//     <div
//       style={{ backgroundColor: "#f09000" }}
//       className="fixed top-0 left-0 w-full z-50 px-6 py-4 shadow-xl"
//     >
//       <div className="max-w-9xl mx-auto flex items-center justify-between">
//         {/* Logo and Title */}
//         <div className="flex items-center gap-3">
//           <Link to="/">
//             <img
//               src={logo}
//               alt="Mindpop Logo"
//               className="h-12 w-auto cursor-pointer"
//             />
//           </Link>

//           <span className="text-[#66220B] font-bold quicksand text-xl">
//             Mindpop
//           </span>
//         </div>

//         {/* Navigation */}
//         <div className="flex-1 flex justify-center bg-transparent quicksand">
//           <SlideTabs activeTab={activeTab} setActiveTab={setActiveTab} />
//         </div>

//         {/* Auth Buttons */}
//         <div className="flex gap-3 quicksand">
//           <Link to="/sign-in">
//             <button className="groups" onClick={() => setActiveTab("Sign Up")}>
//               Sign In
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// const SlideTabs = ({ activeTab, setActiveTab }) => {
//   const [hoverPosition, setHoverPosition] = useState({
//     left: 0,
//     width: 0,
//     opacity: 0,
//   });

//   const tabs = ["HOME", "ABOUT", "GAMES", "SETTINGS"];

//   return (
//     <nav
//       onMouseLeave={() => {
//         setHoverPosition((prev) => ({ ...prev, opacity: 0 }));
//       }}
//       className="relative flex items-center border-2 rounded-full px-1 py-1 bg-transparent"
//     >
//       {tabs.map((tab) => (
//         <Tab
//           key={tab}
//           isActive={activeTab === tab}
//           onClick={() => setActiveTab(tab)}
//           setHoverPosition={setHoverPosition}
//         >
//           {tab}
//         </Tab>
//       ))}
//       <motion.div
//         animate={hoverPosition}
//         initial={false}
//         className="absolute z-0 rounded-full transition-opacity duration-200"
//         style={{ backgroundColor: "#66220B", height: "85%" }}
//       />
//     </nav>
//   );
// };

// const Tab = ({ children, setHoverPosition, isActive, onClick }) => {
//   const ref = useRef(null);

//   return (
//     <button
//       ref={ref}
//       onMouseEnter={() => {
//         if (!ref.current) return;
//         const { width } = ref.current.getBoundingClientRect();
//         setHoverPosition({
//           width,
//           opacity: 1,
//           left: ref.current.offsetLeft,
//         });
//       }}
//       onClick={onClick}
//       className={`
//         relative z-10 px-6 py-2 text-base font-['Quicksand'] transition-colors
//         duration-200 text-[#F09000] whitespace-nowrap rounded-full
//         ${
//           isActive
//             ? "bg-transparent text-white"
//             : "hover: text-wheat rounded-full"
//         }
//       `}
//     >
//       {children}
//     </button>
//   );
// };

// export default Navbar;


import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "../assets/brain_logo.png";
import "../styles/Navbar.css";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("HOME");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  // Handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    // Navigate based on tab
    switch(tab) {
      case 'HOME':
        navigate('/');
        break;
      case 'GAMES':
        if (isLoggedIn) {
          navigate('/games');
        } else {
          navigate('/sign-in');
        }
        break;
      case 'ABOUT':
        navigate('/about');
        break;
      case 'SETTINGS':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  return (
    <div
      style={{ backgroundColor: "#f09000" }}
      className="fixed top-0 left-0 w-full z-50 px-6 py-4 shadow-xl"
    >
      <div className="max-w-9xl mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <Link to="/">
            <img
              src={logo}
              alt="Mindpop Logo"
              className="h-12 w-auto cursor-pointer"
            />
          </Link>

          <span className="text-[#66220B] font-bold quicksand text-xl">
            Mindpop
          </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex justify-center bg-transparent quicksand">
          <SlideTabs activeTab={activeTab} onTabClick={handleTabClick} />
        </div>

        {/* Auth Buttons */}
        <div className="flex gap-3 quicksand">
          {isLoggedIn ? (
            <button 
              className="groups" 
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link to="/sign-in">
              <button className="groups">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const SlideTabs = ({ activeTab, onTabClick }) => {
  const [hoverPosition, setHoverPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const tabs = ["HOME", "ABOUT", "GAMES", "SETTINGS"];

  return (
    <nav
      onMouseLeave={() => {
        setHoverPosition((prev) => ({ ...prev, opacity: 0 }));
      }}
      className="relative flex items-center border-2 rounded-full px-1 py-1 bg-transparent"
    >
      {tabs.map((tab) => (
        <Tab
          key={tab}
          isActive={activeTab === tab}
          onClick={() => onTabClick(tab)}
          setHoverPosition={setHoverPosition}
        >
          {tab}
        </Tab>
      ))}
      <motion.div
        animate={hoverPosition}
        initial={false}
        className="absolute z-0 rounded-full transition-opacity duration-200"
        style={{ backgroundColor: "#66220B", height: "85%" }}
      />
    </nav>
  );
};

const Tab = ({ children, setHoverPosition, isActive, onClick }) => {
  const ref = useRef(null);

  return (
    <button
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setHoverPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      onClick={onClick}
      className={`
        relative z-10 px-6 py-2 text-base font-['Quicksand'] transition-colors
        duration-200 text-[#F09000] whitespace-nowrap rounded-full
        ${
          isActive
            ? "bg-transparent text-white"
            : "hover: text-wheat rounded-full"
        }
      `}
    >
      {children}
    </button>
  );
};

export default Navbar;