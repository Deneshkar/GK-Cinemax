import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/AuthPages.css';

function RegisterPage() {

  const [userName, setUserName]             = useState('');
  const [userEmail, setUserEmail]           = useState('');
  const [userPhone, setUserPhone]           = useState('');
  const [userPassword, setUserPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage]     = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const rules = [
    { label: 'At least 8 characters',              test: (p) => p.length >= 8 },
    { label: 'One uppercase letter',               test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter',               test: (p) => /[a-z]/.test(p) },
    { label: 'One number',                         test: (p) => /\d/.test(p) },
    { label: 'One special character (@$!%*?&)',    test: (p) => /[@$!%*?&]/.test(p) },
  ];

  async function handleRegister(event) {
    event.preventDefault();
    setErrorMessage('');

    if (userPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(userEmail)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(userPassword)) {
      setErrorMessage('Password does not meet all requirements.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: userName, email: userEmail, phone: userPhone, password: userPassword
      });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-container">

      <div className="auth-glow auth-glow-left"  aria-hidden="true"></div>
      <div className="auth-glow auth-glow-right" aria-hidden="true"></div>

      <div className="auth-card">

        <div className="auth-card-rule" aria-hidden="true"></div>

        <div className="auth-logo">
          GK <span className="auth-logo-accent">Cinemax</span>
        </div>

        <p className="auth-eyebrow">New Member</p>
        <h1 className="auth-heading">Join us.</h1>
        <p className="auth-sub">Create an account to start booking.</p>

        {errorMessage && (
          <div className="auth-error" role="alert">{errorMessage}</div>
        )}

        <form onSubmit={handleRegister} noValidate>

          <label className="field-label">Full Name</label>
          <input
            type="text"
            className="auth-input"
            placeholder="Your full name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            autoComplete="name"
          />

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

          <label className="field-label">Phone Number</label>
          <input
            type="tel"
            className="auth-input"
            placeholder="07X XXX XXXX"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            required
            autoComplete="tel"
          />

          <label className="field-label">Password</label>
          <input
            type="password"
            className="auth-input"
            placeholder="Create a strong password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {/* Live password requirements */}
          {userPassword.length > 0 && (
            <ul className="pwd-rules">
              {rules.map((r, i) => {
                const met = r.test(userPassword);
                return (
                  <li key={i} className={met ? 'rule-met' : 'rule-unmet'}>
                    <span className="rule-dot" aria-hidden="true"></span>
                    {r.label}
                  </li>
                );
              })}
            </ul>
          )}

          <label className="field-label">Confirm Password</label>
          <input
            type="password"
            className="auth-input"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="auth-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;