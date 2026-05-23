import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/AuthPages.css';

// The login page — user enters email and password to log in
function LoginPage() {

  // userEmail and userPassword hold what the user types in the form
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  // errorMessage shows any login error to the user
  const [errorMessage, setErrorMessage] = useState('');

  // isSubmitting is true while the API call is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handles the login form submission
  async function handleLogin(event) {

    // Prevent the browser from refreshing the page on form submit
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: userEmail,
        password: userPassword
      });

      // Save the user and token using the AuthContext login function
      login(response.data.user, response.data.token);

      // Send the user to the home page after successful login
      navigate('/');

    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* Title */}
        <h2>
          <span className="logo-gk">GK</span> 
          <span className="logo-cine">Cine</span>
          <span className="logo-max">max</span>
        </h2>
        <p className="auth-subtitle">Welcome back! Login to book your tickets.</p>

        {/* Error message */}
        {errorMessage && (
          <div className="auth-error">{errorMessage}</div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin}>

          {/* Email field */}
          <label>Email Address</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={userEmail}
            onChange={(event) => setUserEmail(event.target.value)}
            required
          />

          {/* Password field */}
          <label>Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="Enter your password"
            value={userPassword}
            onChange={(event) => setUserPassword(event.target.value)}
            required
          />

          {/* Submit button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

        </form>

        {/* Link to register page */}
        <div className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;