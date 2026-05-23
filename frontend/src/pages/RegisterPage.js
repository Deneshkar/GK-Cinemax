import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/AuthPages.css';

// The register page — user fills in their details to create an account
function RegisterPage() {

  // Form field values
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // errorMessage shows any registration error to the user
  const [errorMessage, setErrorMessage] = useState('');

  // isSubmitting is true while the API call is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handles the register form submission
  async function handleRegister(event) {

    // Prevent the browser from refreshing the page on form submit
    event.preventDefault();
    setErrorMessage('');

    // Check that both passwords match before sending to backend
    if (userPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // Check password is at least 6 characters
    if (userPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: userName,
        email: userEmail,
        phone: userPhone,
        password: userPassword
      });

      // Save the user and token — auto login after register
      login(response.data.user, response.data.token);

      // Send the user to the home page
      navigate('/');

    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* Title */}
        <h2>🎬 Create Account</h2>
        <p className="auth-subtitle">Join GK Cinemax and start booking tickets</p>

        {/* Error message */}
        {errorMessage && (
          <div className="auth-error">{errorMessage}</div>
        )}

        {/* Register form */}
        <form onSubmit={handleRegister}>

          {/* Name field */}
          <label>Full Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="Your full name"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
            required
          />

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

          {/* Phone field */}
          <label>Phone Number</label>
          <input
            type="tel"
            className="input-field"
            placeholder="07X XXX XXXX"
            value={userPhone}
            onChange={(event) => setUserPhone(event.target.value)}
            required
          />

          {/* Password field */}
          <label>Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="At least 6 characters"
            value={userPassword}
            onChange={(event) => setUserPassword(event.target.value)}
            required
          />

          {/* Confirm password field */}
          <label>Confirm Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          {/* Submit button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        {/* Link to login page */}
        <div className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </div>

      </div>
    </div>
  );
}

export default RegisterPage;