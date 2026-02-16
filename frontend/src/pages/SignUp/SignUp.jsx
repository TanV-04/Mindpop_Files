// frontend/src/pages/SignUp/SignUp.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../utils/apiService';
import './signUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name:      '',
    username:  '',
    email:     '',
    password:  '',
    birthDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name:     formData.name,
        username: formData.username,
        email:    formData.email,
        password: formData.password,
        isAdmin,
      };

      if (!isAdmin) {
        if (!formData.birthDate) {
          setError('Please enter your date of birth.');
          setLoading(false);
          return;
        }
        payload.birthDate = formData.birthDate;
      }

      const response = await authService.register(payload);

      if (response.success) {
        // Persist user to localStorage
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
          navigate('/admin');
        } else {
          // Store age group for game logic
          const age = response.user.age;
          let ageGroup = '8-10';
          if (age >= 6 && age <= 8)   ageGroup = '6-8';
          else if (age >= 9  && age <= 10) ageGroup = '8-10';
          else if (age >= 11 && age <= 12) ageGroup = '10-12';
          else if (age >= 13 && age <= 14) ageGroup = '12-14';
          localStorage.setItem('userAgeGroup', ageGroup);
          navigate('/games');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title quicksand">
            {isAdmin ? '👩‍💼 Admin Sign Up' : '🌟 Join MindPop!'}
          </h1>
          <p className="auth-subtitle">
            {isAdmin
              ? 'Create an admin account to monitor children&apos;s progress'
              : 'Create your account and start the adventure!'}
          </p>
        </div>

        {/* Admin Toggle */}
        <div className="admin-toggle-wrapper">
          <span className="admin-toggle-label">Admin Account</span>
          <button
            type="button"
            className={`admin-toggle ${isAdmin ? 'active' : ''}`}
            onClick={() => setIsAdmin((prev) => !prev)}
            aria-pressed={isAdmin}
            title="Toggle admin registration"
          >
            <span className="toggle-thumb" />
          </button>
          <span className="admin-toggle-status">{isAdmin ? 'ON' : 'OFF'}</span>
        </div>

        {isAdmin && (
          <div className="admin-notice">
            ℹ️ Admin accounts can view all children&apos;s performance metrics. No age restriction applies.
          </div>
        )}

        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <div className="input-container">
              <i className="fa-solid fa-user input-icon" />
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <div className="input-container">
              <i className="fa-solid fa-at input-icon" />
              <input
                id="username"
                name="username"
                type="text"
                className="form-input"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-container">
              <i className="fa-solid fa-lock input-icon" />
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Date of Birth – only for child accounts */}
          {!isAdmin && (
            <div className="form-group">
              <label htmlFor="birthDate" className="form-label">
                Date of Birth <span className="text-sm text-gray-500">(ages 5–14 only)</span>
              </label>
              <div className="input-container">
                <i className="fa-solid fa-calendar input-icon" />
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  className="form-input"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required={!isAdmin}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 5))
                    .toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 14))
                    .toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="submit-btn quicksand"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Creating account...
              </>
            ) : isAdmin ? (
              'Create Admin Account 👩‍💼'
            ) : (
              "Let's Go! 🚀"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="footer-text">
            Already have an account?{' '}
            <Link to="/sign-in" className="footer-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
