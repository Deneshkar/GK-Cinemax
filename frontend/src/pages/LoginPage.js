import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/AuthPages.css';

function LoginPage() {

  const [userEmail, setUserEmail]       = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: userEmail,
        password: userPassword
      });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="auth-container"
      style={{ '--auth-bg-image': `url(${process.env.PUBLIC_URL}/page.jpg)` }}
    >

      {/* Ambient spotlights */}
      <div className="auth-glow auth-glow-left"  aria-hidden="true"></div>
      <div className="auth-glow auth-glow-right" aria-hidden="true"></div>

      <div className="auth-card">

        {/* Top rule */}
        <div className="auth-card-rule" aria-hidden="true"></div>

        {/* Logo */}
        <div className="auth-logo">
          GK <span className="auth-logo-accent">Cinemax</span>
        </div>

        <p className="auth-eyebrow">Member Access</p>
        <h1 className="auth-heading">Welcome back.</h1>
        <p className="auth-sub">Sign in to manage your bookings.</p>

        {errorMessage && (
          <div className="auth-error" role="alert">{errorMessage}</div>
        )}

        <form onSubmit={handleLogin} noValidate>

          <label className="field-label">Email Address</label>
          <input
            type="email"
            className="auth-input"
            placeholder="you@example.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label className="field-label">Password</label>
          <div className="auth-password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              className="auth-input auth-input-with-action"
              placeholder="Enter your password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <p className="auth-forgot-row">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>

          <button
            type="submit"
            className="auth-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>

        </form>

        <p className="auth-switch">
          No account yet?{' '}
          <Link to="/register">Create one</Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;