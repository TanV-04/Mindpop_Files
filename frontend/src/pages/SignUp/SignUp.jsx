import React, { useState } from "react";
import "./signUp.css";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [emailField, setEmailField] = useState("");
  const navigate = useNavigate();

  async function handleSignUp(e) {
    e.preventDefault();

    // check if the fields are empty
    if (!user || !emailField || !password) {
      alert("Please fill in all the fields");
      return;
    }

    try {
      // send a POST request to the backend with the form data
      const response = await axios
        .post("http://localhost:8000/sign-up", {
          user,
          email: emailField,
          password,
        })
        .then((res) => {
          if ((res.data == "exists")) {
            alert("user already exists");
          } else if ((res.data == "notexists")) {

            // navigate to dashboard if already signed in
            navigate("/dashboard", { state: { id: email } });
          }
        })
        .catch((e) => {
          alert("wrong details");
          console.log(e);
        });

      console.log(response.data);
      alert("Account created successfully!");

      // clear the form fields
      setUser("");
      setPassword("");
      setEmailField("");
    } catch (error) {
      console.error("Error signing up:", error);
      alert("Error creating account. Please try again.");
    }
  }

  return (
    <div className="login-container quicksand">
      <h2 className="form-title">Sign Up</h2>

      <form onSubmit={handleSignUp} className="login-form">
        <div className="input-wrapper">
          <input
            onChange={(e) => setUser(e.target.value)} // use the onChange handler to update the state for the fields
            type="text"
            className="input-field"
            placeholder="Enter your user name"
            value={user} // specifies the current value that the user has entered into the field or the initial value for the field.
            required
          />
          <i class="fa-regular fa-user" />
        </div>

        <div className="input-wrapper">
          <input
            onChange={(e) => setEmailField(e.target.value)}
            type="email"
            className="input-field"
            placeholder="Email address"
            value={emailField}
            required
          />
          <i class="fa-regular fa-envelope" />
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
          <i class="fa-solid fa-lock" />
        </div>
        <button onClick={handleSignUp} className="login-button">
          Create Account
        </button>
      </form>

      <p className="signup-text mt-4 mb-6 sm:mt-6 sm:mb-8 md:mt-8 md:mb-10">
        Already have an account? Please
        <Link to="/sign-in">
          <a className="text-blue-500 font-semibold hover:text-blue-700 p-2 rounded-md transition-all">
            sign In
          </a>
        </Link>
      </p>
    </div>
  );
};

export default SignUp;

// in react, for an input field to be a controlled component (react controls its value), make sure
// both the value and onChange handler are properly defined.

// value binds the value of the input field the the state variables
// the onChange updates the state variable whenever the user types in the input field

// when you use value, the form element becomes a controlled element, without it, react would not be able to track/manage the form's value
// react manages and keeps the input field's value in sync with the component's state
