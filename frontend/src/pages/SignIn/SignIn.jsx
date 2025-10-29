import { useState } from "react";
import googleLogo from "../../assets/google.svg";
import "./signIn.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../utils/apiService";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the redirect path if user was redirected from a protected route
  const from = location.state?.from?.pathname || "/games";

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        email,
        password,
      });

      if (response.success) {
        // ✅ Store user info and token in localStorage
        // localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: response.user.name,
            email: response.user.email,
            age: response.user.age,
          })
        );
        localStorage.setItem("token", response.token);

        setIsLoggedIn(true); // optional, for UI state
        navigate(from); // redirect to intended page
      }

      // Clear form
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.error ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    console.log("Google Login clicked");
  };

  return (
    <div className="login-container quicksand">
      <h2 className="form-title">Log in</h2>

      {error && (
        <div className="error-message text-red-500 mb-4 text-center">
          {error}
        </div>
      )}

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

        <a href="#" className="forgot-pass-link mb-3">
          Forgot password?
        </a>
        {/* 
        <h2 className="small-heading">Or log in using</h2> */}

        {/* <div className="social-login border border-gray-600 rounded-md mb-4 cursor-pointer">
          <button 
            type="button"
            className="social-abbreviation" 
            onClick={handleGoogleLogin}
          >
            <img src={googleLogo} alt="google" className="social-icon" />
            Google
          </button>
        </div> */}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
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
