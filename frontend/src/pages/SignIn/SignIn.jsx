// frontend/src/pages/SignIn/SignIn.jsx
import { useState } from 'react';
import './signIn.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../utils/apiService';

const SignIn = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState('');

  // After login, admin goes to /admin, children go to /games (or the page they were trying to reach)
  const from = location.state?.from?.pathname || '/games';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields!');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(formData);

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem(
          'user',
          JSON.stringify({
            id:       response.user.id,
            name:     response.user.name,
            email:    response.user.email,
            age:      response.user.age,
            isAdmin:  response.user.isAdmin,
          })
        );

        if (response.user.isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          // Store age group for game logic
          const age = response.user.age || 8;
          let ageGroup = '8-10';
          if (age >= 6 && age <= 8)    ageGroup = '6-8';
          else if (age >= 9  && age <= 10) ageGroup = '8-10';
          else if (age >= 11 && age <= 12) ageGroup = '10-12';
          else if (age >= 13 && age <= 14) ageGroup = '12-14';
          localStorage.setItem('userAgeGroup', ageGroup);
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title quicksand">Welcome Back! 👋</h1>
          <p className="auth-subtitle">Let&apos;s continue your learning adventure</p>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-container">
              <i className="fa-regular fa-envelope input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-container">
              <i className="fa-solid fa-lock input-icon" />
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn quicksand" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Logging in...
              </>
            ) : (
              "Let's Go! 🚀"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="footer-text">
            New to MindPop?{' '}
            <Link to="/sign-up" className="footer-link">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
