// import React, { useState } from "react";
// import "./signUp.css";
// import { Link, useNavigate } from "react-router-dom";

// const SignUp = () => {
//   const [user, setUser] = useState("");
//   const [password, setPassword] = useState("");
//   const [emailField, setEmailField] = useState("");
//   const navigate = useNavigate();

//   async function handleSignUp(e) {
//     e.preventDefault();

//     // check if the fields are empty
//     if (!user || !emailField || !password) {
//       alert("Please fill in all the fields");
//       return;
//     }

//     try {
//       // send a POST request to the backend with the form data
//       const response = await axios
//         .post("http://localhost:8000/sign-up", {
//           user,
//           email: emailField,
//           password,
//         })
//         .then((res) => {
//           if ((res.data == "exists")) {
//             alert("user already exists");
//           } else if ((res.data == "notexists")) {

//             // navigate to dashboard if already signed in
//             navigate("/dashboard", { state: { id: email } });
//           }
//         })
//         .catch((e) => {
//           alert("wrong details");
//           console.log(e);
//         });

//       console.log(response.data);
//       alert("Account created successfully!");

//       // clear the form fields
//       setUser("");
//       setPassword("");
//       setEmailField("");
//     } catch (error) {
//       console.error("Error signing up:", error);
//       alert("Error creating account. Please try again.");
//     }
//   }

//   return (
//     <div className="login-container quicksand">
//       <h2 className="form-title">Sign Up</h2>

//       <form onSubmit={handleSignUp} className="login-form">
//         <div className="input-wrapper">
//           <input
//             onChange={(e) => setUser(e.target.value)} // use the onChange handler to update the state for the fields
//             type="text"
//             className="input-field"
//             placeholder="Enter your user name"
//             value={user} // specifies the current value that the user has entered into the field or the initial value for the field.
//             required
//           />
//           <i class="fa-regular fa-user" />
//         </div>

//         <div className="input-wrapper">
//           <input
//             onChange={(e) => setEmailField(e.target.value)}
//             type="email"
//             className="input-field"
//             placeholder="Email address"
//             value={emailField}
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
//         <button onClick={handleSignUp} className="login-button">
//           Create Account
//         </button>
//       </form>

//       <p className="signup-text mt-4 mb-6 sm:mt-6 sm:mb-8 md:mt-8 md:mb-10">
//         Already have an account? Please
//         <Link to="/sign-in">
//           <a className="text-blue-500 font-semibold hover:text-blue-700 p-2 rounded-md transition-all">
//             sign In
//           </a>
//         </Link>
//       </p>
//     </div>
//   );
// };

// export default SignUp;

// // in react, for an input field to be a controlled component (react controls its value), make sure
// // both the value and onChange handler are properly defined.

// // value binds the value of the input field the the state variables
// // the onChange updates the state variable whenever the user types in the input field

// // when you use value, the form element becomes a controlled element, without it, react would not be able to track/manage the form's value
// // react manages and keeps the input field's value in sync with the component's state




//new code

// import React, { useState } from "react";
// import "./signUp.css";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";

// const SignUp = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: ""
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Sending registration data:", formData);

//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/auth/register`, 
//         formData,
//         {
//           withCredentials: true,
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//           }
//         }
//       );

//       console.log("Server response:", response.data);

//       if (response.data.success) {
//         localStorage.setItem('token', response.data.token);
//         setFormData({
//           username: "",
//           email: "",
//           password: ""
//         });
//         navigate("/sign-in");
//         alert("Registration successful! Please log in.");
//       }
//     } catch (error) {
//       console.error("Error details:", error.response?.data);
//       alert(error.response?.data?.error || "Error creating account. Please try again.");
//     }
// };

//   return (
//     <div className="login-container quicksand">
//       <h2 className="form-title">Sign Up</h2>

//       <form onSubmit={handleSubmit} className="login-form">
//         <div className="input-wrapper">
//           <input
//             name="username"
//             type="text"
//             className="input-field"
//             placeholder="Enter your user name"
//             value={formData.username}
//             onChange={handleChange}
//             required
//           />
//           <i className="fa-regular fa-user" />
//         </div>

//         <div className="input-wrapper">
//           <input
//             name="email"
//             type="email"
//             className="input-field"
//             placeholder="Email address"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />
//           <i className="fa-regular fa-envelope" />
//         </div>

//         <div className="input-wrapper">
//           <input
//             name="password"
//             type="password"
//             className="input-field"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             minLength={6}
//             required
//           />
//           <i className="fa-solid fa-lock" />
//         </div>

//         <button type="submit" className="login-button">
//           Create Account
//         </button>
//       </form>

//       <p className="signup-text mt-4 mb-6 sm:mt-6 sm:mb-8 md:mt-8 md:mb-10">
//         Already have an account? Please{" "}
//         <Link to="/sign-in">
//           <span className="text-blue-500 font-semibold hover:text-blue-700 p-2 rounded-md transition-all">
//             Sign In
//           </span>
//         </Link>
//       </p>
//     </div>
//   );
// };

// export default SignUp;

import { useState } from "react";
import "./signUp.css";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../utils/apiService";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    age: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value
    }));
  };

  // Helper to classify age group
  const classifyAgeGroup = (age) => {
    if (age >= 5 && age <= 7) return "5-7";
    if (age >= 8 && age <= 10) return "8-10";
    if (age >= 11 && age <= 12) return "11-12";
    return "8-10"; // Default age group if age is not provided or outside range
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.age && (formData.age < 0 || formData.age > 120)) {
      setError("Please enter a valid age between 0 and 120");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        username: formData.username,
        name: formData.name,
        email: formData.email,
        age: formData.age || undefined,
        password: formData.password
      });

      // Classify age group and save it to localStorage
      const ageGroup = classifyAgeGroup(formData.age);
      localStorage.setItem("userAgeGroup", ageGroup);

      setFormData({
        username: "",
        name: "",
        email: "",
        age: "",
        password: ""
      });

      navigate("/sign-in");
      alert("Registration successful! Please log in.");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.response?.data?.error || "Error creating account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container quicksand">
      <h2 className="form-title">Sign Up</h2>

      {error && (
        <div className="error-message text-red-500 mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-wrapper">
          <input
            name="username"
            type="text"
            className="input-field"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <i className="fa-regular fa-user" />
        </div>

        <div className="input-wrapper">
          <input
            name="name"
            type="text"
            className="input-field"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <i className="fa-solid fa-id-card" />
        </div>

        <div className="input-wrapper">
          <input
            name="email"
            type="email"
            className="input-field"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <i className="fa-regular fa-envelope" />
        </div>

        <div className="input-wrapper">
          <input
            name="age"
            type="number"
            className="input-field"
            placeholder="Your age (optional)"
            value={formData.age}
            onChange={handleChange}
            min="0"
            max="120"
          />
          <i className="fa-solid fa-calendar-days" />
        </div>

        <div className="input-wrapper">
          <input
            name="password"
            type="password"
            className="input-field"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            required
          />
          <i className="fa-solid fa-lock" />
        </div>

        <button 
          type="submit" 
          className="login-button"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="signup-text mt-4 mb-6 sm:mt-6 sm:mb-8 md:mt-8 md:mb-10">
        Already have an account? Please{" "}
        <Link to="/sign-in">
          <span className="text-blue-500 font-semibold hover:text-blue-700 p-2 rounded-md transition-all">
            Sign In
          </span>
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
