import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/AuthPages.css';

const API_BASE = 'http://localhost:5000/api/auth';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function RegisterPage() {

  const [registrationStep, setRegistrationStep] = useState('details');
  const [userName, setUserName]             = useState('');
  const [userEmail, setUserEmail]           = useState('');
  const [userPhone, setUserPhone]           = useState('');
  const [userPassword, setUserPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationOtp, setRegistrationOtp] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage]     = useState('');
  const [successMessage, setSuccessMessage]  = useState('');
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

  async function handleRequestOtp(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (userPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!EMAIL_REGEX.test(userEmail)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!PASSWORD_REGEX.test(userPassword)) {
      setErrorMessage('Password does not meet all requirements.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE}/register`, {
        name: userName, email: userEmail, phone: userPhone, password: userPassword
      });
      setSuccessMessage(response.data.message);
      setRegistrationStep('otp');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!/^\d{6}$/.test(registrationOtp.trim())) {
      setErrorMessage('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE}/register`, {
        email: userEmail,
        otp: registrationOtp.trim(),
      });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE}/register`, {
        name: userName,
        email: userEmail,
        phone: userPhone,
        password: userPassword,
      });
      setSuccessMessage(response.data.message);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="auth-container"
      style={{ '--auth-bg-image': `url(${process.env.PUBLIC_URL}/page.jpg)` }}
    >

      <div className="auth-glow auth-glow-left"  aria-hidden="true"></div>
      <div className="auth-glow auth-glow-right" aria-hidden="true"></div>

      <div className="auth-card">

        <div className="auth-card-rule" aria-hidden="true"></div>

        <div className="auth-logo">
          GK <span className="auth-logo-accent">Cinemax</span>
        </div>

        <p className="auth-eyebrow">New Member</p>
        <h1 className="auth-heading">Join us.</h1>
        <p className="auth-sub">
          {registrationStep === 'details'
            ? 'Create your details, then verify your email with a one-time code.'
            : `Enter the 6-digit code sent to ${userEmail}`}
        </p>

        {errorMessage && (
          <div className="auth-error" role="alert">{errorMessage}</div>
        )}

        {successMessage && (
          <output className="auth-success">{successMessage}</output>
        )}

        {registrationStep === 'details' && (
          <form onSubmit={handleRequestOtp} noValidate>

          <label className="field-label" htmlFor="register-name">Full Name</label>
          <input
            id="register-name"
            type="text"
            className="auth-input"
            placeholder="Your full name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            autoComplete="name"
          />

          <label className="field-label" htmlFor="register-email">Email Address</label>
          <input
            id="register-email"
            type="email"
            className="auth-input"
            placeholder="you@example.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label className="field-label" htmlFor="register-phone">Phone Number</label>
          <input
            id="register-phone"
            type="tel"
            className="auth-input"
            placeholder="07X XXX XXXX"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            required
            autoComplete="tel"
          />

          <label className="field-label" htmlFor="register-password">Password</label>
          <div className="auth-password-field">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              className="auth-input auth-input-with-action"
              placeholder="Create a strong password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              required
              autoComplete="new-password"
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

          {/* Live password requirements */}
          {userPassword.length > 0 && (
            <ul className="pwd-rules">
              {rules.map((r) => {
                const met = r.test(userPassword);
                return (
                  <li key={r.label} className={met ? 'rule-met' : 'rule-unmet'}>
                    <span className="rule-dot" aria-hidden="true"></span>
                    {r.label}
                  </li>
                );
              })}
            </ul>
          )}

          <label className="field-label" htmlFor="register-confirm-password">Confirm Password</label>
          <div className="auth-password-field">
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              className="auth-input auth-input-with-action"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowConfirmPassword((current) => !current)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending OTP…' : 'Create Account'}
          </button>

          </form>
        )}

        {registrationStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} noValidate>
            <label className="field-label" htmlFor="register-otp">One-Time Password (OTP)</label>
            <input
              id="register-otp"
              type="text"
              className="auth-input auth-otp-input"
              placeholder="123456"
              value={registrationOtp}
              onChange={(e) => setRegistrationOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
            />

            <button
              type="submit"
              className="auth-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying…' : 'Verify OTP & Create Account'}
            </button>

            <button
              type="button"
              className="auth-link-btn"
              onClick={handleResendOtp}
              disabled={isSubmitting}
            >
              Resend OTP
            </button>

            <button
              type="button"
              className="auth-link-btn"
              onClick={() => {
                setRegistrationStep('details');
                setRegistrationOtp('');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              disabled={isSubmitting}
            >
              Edit details
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;