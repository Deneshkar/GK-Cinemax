import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AuthPages.css';

const API_BASE = 'http://localhost:5000/api/auth';
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState('email');
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRules = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'One number', test: (p) => /\d/.test(p) },
    { label: 'One special character (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) },
  ];

  async function handleSendOtp(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!EMAIL_REGEX.test(userEmail)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE}/forgot-password`, { email: userEmail });
      setSuccessMessage(response.data.message);
      setStep('reset');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE}/forgot-password`, { email: userEmail });
      setSuccessMessage(response.data.message);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!/^\d{6}$/.test(otp.trim())) {
      setErrorMessage('Please enter the 6-digit OTP from your email.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      setErrorMessage('Password does not meet all requirements.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE}/reset-password`, {
        email: userEmail,
        otp: otp.trim(),
        password: newPassword,
      });
      setSuccessMessage(response.data.message);
      setStep('done');
      setTimeout(() => navigate('/login'), 2500);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="auth-container"
      style={{ '--auth-bg-image': `url(${process.env.PUBLIC_URL}/page.jpg)` }}
    >
      <div className="auth-glow auth-glow-left" aria-hidden="true"></div>
      <div className="auth-glow auth-glow-right" aria-hidden="true"></div>

      <div className="auth-card">
        <div className="auth-card-rule" aria-hidden="true"></div>

        <div className="auth-logo">
          GK <span className="auth-logo-accent">Cinemax</span>
        </div>

        <p className="auth-eyebrow">Account Recovery</p>
        <h1 className="auth-heading">
          {step === 'email' && 'Forgot password?'}
          {step === 'reset' && 'Reset password'}
          {step === 'done' && 'All set'}
        </h1>
        <p className="auth-sub">
          {step === 'email' && 'Enter your account email and we will send you a one-time code.'}
          {step === 'reset' && `Enter the 6-digit code sent to ${userEmail}`}
          {step === 'done' && 'Redirecting you to sign in…'}
        </p>

        {errorMessage && (
          <div className="auth-error" role="alert">{errorMessage}</div>
        )}

        {successMessage && (
          <div className="auth-success" role="status">{successMessage}</div>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendOtp} noValidate>
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

            <button type="submit" className="auth-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} noValidate>
            <label className="field-label">One-Time Password (OTP)</label>
            <input
              type="text"
              className="auth-input auth-otp-input"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
            />

            <label className="field-label">New Password</label>
            <div className="auth-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input auth-input-with-action"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            <ul className="pwd-rules">
              {passwordRules.map((rule) => (
                <li
                  key={rule.label}
                  className={rule.test(newPassword) ? 'rule-met' : 'rule-unmet'}
                >
                  <span className="rule-dot" aria-hidden="true"></span>
                  {rule.label}
                </li>
              ))}
            </ul>

            <label className="field-label">Confirm New Password</label>
            <div className="auth-password-field">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="auth-input auth-input-with-action"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button type="submit" className="auth-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Updating…' : 'Update Password'}
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
                setStep('email');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              disabled={isSubmitting}
            >
              Use a different email
            </button>
          </form>
        )}

        {step === 'done' && (
          <p className="auth-switch">
            <Link to="/login">Go to sign in now</Link>
          </p>
        )}

        {step !== 'done' && (
          <p className="auth-switch">
            Remember your password?{' '}
            <Link to="/login">Back to sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
