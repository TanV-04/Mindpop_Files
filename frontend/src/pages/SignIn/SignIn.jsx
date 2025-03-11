// import React, { useState } from "react";
// import googleLogo from "../../assets/google.svg";
// import "./signIn.css";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";

// const SignIn = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   async function handleLogin(e) {
//     e.preventDefault();

//     // check if both fields are empty
//     if (!email || !password) {
//       alert("Please enter both email and password.");
//       return;
//     }

//     // debugging
//     console.log("Email:", email);
//     console.log("Password:", password);

//     try {
//       // send a post request with the email and password to the backend
//       const response = await axios
//         .post("http://localhost:8000/sign-in", {
//           email,
//           password,
//         })
//         .then((res) => {
//           if ((res.data == "exists")) {
//             navigate("/dashboard", { state: { id: email } }); //direct to the dashboard of the corresponding user
//           } else if ((res.data == "notexists")) {
//             alert("sign in please");
//           }
//         })
//         .catch(e => {
//           alert("wrong details");
//           console.log(e);
//         })

//       console.log(response.data);
//       alert("Login successful!");

//       // clear the fields after a successful login
//       setEmail("");
//       setPassword("");
//     } catch (error) {
//       // handle failure
//       console.error("Error logging in:", error);
//       alert("Login failed. Please check your credentials.");
//     }
//   }

//   const handleGoogleLogin = (e) => {
//     e.preventDefault(); // prevent form validation when the Google button is clicked
//     console.log("Google Login clicked");
//   };

//   return (
//     <div className="login-container quicksand">
//       <h2 className="form-title">Log in</h2>

//       <form action="POST" onSubmit={handleLogin} className="login-form">
//         <div className="input-wrapper">
//           <input
//             onChange={(e) => setEmail(e.target.value)}
//             type="email"
//             className="input-field"
//             placeholder="Email address"
//             value={email}
//             required
//           />
//           <i class="fa-regular fa-envelope" />
//         </div>

//         <div className="input-wrapper">
//           <input
//             onChange={(e) => setPassword(e.target.value)}
//             type="password"
//             className="input-field"
//             placeholder="Password"
//             value={password}
//             required
//           />
//           <i class="fa-solid fa-lock" />
//         </div>
//         <a href="#" className="forgot-pass-link">
//           Forgot password?
//         </a>

//         <h2 className="small-heading">Or log in using</h2>

//         <div className="social-login border border-gray-600 rounded-md mb-4 cursor-pointer">
//           <button className="social-abbreviation" onClick={handleGoogleLogin}>
//             <img src={googleLogo} alt="google" className="social-icon" />
//             Google
//           </button>
//         </div>

//         <button onClick={handleLogin} className="login-button">
//           Log In
//         </button>
//       </form>
//       {/* <p className="signup-text">
//         Don't have an account? <a href="#">Signup Now</a>
//       </p> */}
//       <p className="signup-text mt-4 mb-6 sm:mt-6 sm:mb-8 md:mt-8 md:mb-10">
//         Don't have an account?
//         <Link to="/sign-up">
//           <a className="text-blue-500 font-semibold hover:text-blue-700 p-2 rounded-md transition-all">
//             Sign Up Now
//           </a>
//         </Link>
//       </p>
//     </div>
//   );
// };

// export default SignIn;



//new code
// import React, { useState } from "react";
// import googleLogo from "../../assets/google.svg";
// import "./signIn.css";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";

// const SignIn = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   async function handleLogin(e) {
//     e.preventDefault();

//     if (!email || !password) {
//       alert("Please enter both email and password.");
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/auth/login`,
//         {
//           email,
//           password,
//         },
//         {
//           withCredentials: true,
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//           }
//         }
//       );

//       if (response.data.success) {
//         // Store the token in localStorage
//         localStorage.setItem('token', response.data.token);
        
//         // Navigate to dashboard
//         navigate("/dashboard");
        
//         // Clear form
//         setEmail("");
//         setPassword("");
        
//         alert("Login successful!");
//       }
//     } catch (error) {
//       console.error("Login error:", error.response?.data?.error || error.message);
//       alert(error.response?.data?.error || "Login failed. Please check your credentials.");
//     }
//   }

//   const handleGoogleLogin = (e) => {
//     e.preventDefault(); // prevent form validation when the Google button is clicked
//     console.log("Google Login clicked");
//   };

//   return (
//     <div className="login-container quicksand">
//       <h2 className="form-title">Log in</h2>

//       <form onSubmit={handleLogin} className="login-form">
//         <div className="input-wrapper">
//           <input
//             onChange={(e) => setEmail(e.target.value)}
//             type="email"
//             className="input-field"
//             placeholder="Email address"
//             value={email}
//             required
//           />
//           <i className="fa-regular fa-envelope" />
//         </div>

//         <div className="input-wrapper">
//           <input
//             onChange={(e) => setPassword(e.target.value)}
//             type="password"
//             className="input-field"
//             placeholder="Password"
//             value={password}
//             required
//           />
//           <i className="fa-solid fa-lock" />
//         </div>
        
//         <a href="#" className="forgot-pass-link">
//           Forgot password?
//         </a>

//         <h2 className="small-heading">Or log in using</h2>

//         <div className="social-login border border-gray-600 rounded-md mb-4 cursor-pointer">
//           <button 
//             type="button" // Add type="button" to prevent form submission
//             className="social-abbreviation" 
//             onClick={handleGoogleLogin}
//           >
//             <img src={googleLogo} alt="google" className="social-icon" />
//             Google
//           </button>
//         </div>

//         <button type="submit" className="login-button">
//           Log In
//         </button>

//         <p className="signup-text mt-4 mb-6 sm:mt-6 sm:mb-8 md:mt-8 md:mb-10">
//           Don't have an account?
//           <Link to="/sign-up">
//             <span className="text-blue-500 font-semibold hover:text-blue-700 p-2 rounded-md transition-all">
//               Sign Up Now
//             </span>
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default SignIn;


import { useState } from "react";
import googleLogo from "../../assets/google.svg";
import "./signIn.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Get the redirect path if user was redirected from a protected route
  const from = location.state?.from?.pathname || "/";

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Navigate to the page user was trying to access, or to games page
        navigate(from === "/" ? "/games" : from);
        
        // Clear form
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data?.error || error.message);
      alert(error.response?.data?.error || "Login failed. Please check your credentials.");
    }
  }

  const handleGoogleLogin = (e) => {
    e.preventDefault(); // prevent form validation when the Google button is clicked
    console.log("Google Login clicked");
  };

  return (
    <div className="login-container quicksand">
      <h2 className="form-title">Log in</h2>

      <form onSubmit={handleLogin} className="login-form">
        <div className="input-wrapper">
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="input-field"
            placeholder="Email address"
            value={email}
            required
          />
          <i className="fa-regular fa-envelope" />
        </div>

        <div className="input-wrapper">
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            required
          />
          <i className="fa-solid fa-lock" />
        </div>
        
        <a href="#" className="forgot-pass-link">
          Forgot password?
        </a>

        <h2 className="small-heading">Or log in using</h2>

        <div className="social-login border border-gray-600 rounded-md mb-4 cursor-pointer">
          <button 
            type="button" // Add type="button" to prevent form submission
            className="social-abbreviation" 
            onClick={handleGoogleLogin}
          >
            <img src={googleLogo} alt="google" className="social-icon" />
            Google
          </button>
        </div>

        <button type="submit" className="login-button">
          Log In
        </button>

        <p className="signup-text mt-4 mb-6 sm:mt-6 sm:mb-8 md:mt-8 md:mb-10">
          Don&apos;t have an account?
          <Link to="/sign-up">
            <span className="text-blue-500 font-semibold hover:text-blue-700 p-2 rounded-md transition-all">
              Sign Up Now
            </span>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignIn;