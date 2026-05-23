import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/EditProfilePage.css';

function EditProfilePage() {
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  // State for form fields
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userPassword, setUserPassword] = useState('');

  // Status messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is not logged in, boot them out
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Fetch their current profile from the backend to pre-fill the form
    async function fetchProfile() {
      try {
        const token = localStorage.getItem('gkToken');
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserName(response.data.name || '');
        setUserEmail(response.data.email || '');
        setUserPhone(response.data.phone || '');
      } catch (error) {
        setErrorMessage('Failed to load profile details.');
      }
    }
    
    fetchProfile();
  }, [currentUser, navigate]);

  async function handleUpdateProfile(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Optional Check: strict valid email
    if (userEmail) {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(userEmail)) {
        setErrorMessage('Please provide a valid working email address.');
        return;
        }
    }

    // Optional Check: strict valid password (only if they typed something)
    if (userPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(userPassword)) {
        setErrorMessage('Password must be at least 8 characters, include uppercase, lowercase, number, and special character.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('gkToken');
      
      const payload = {
        name: userName,
        email: userEmail,
        phone: userPhone
      };
      
      // Only include password in the request if they are trying to change it
      if (userPassword) {
        payload.password = userPassword;
      }

      const response = await axios.put('http://localhost:5000/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update contexts and localStorage with new user data & token
      updateCurrentUser(response.data.user, response.data.token);
      
      setSuccessMessage('Profile updated successfully!');
      setUserPassword(''); // clear password box after success

    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        
        <h2>Edit Profile</h2>
        <p className="profile-subtitle">Update your personal account details</p>

        {errorMessage && <div className="profile-error">{errorMessage}</div>}
        {successMessage && <div className="profile-success">{successMessage}</div>}

        <form onSubmit={handleUpdateProfile}>
          
          <label>Full Name</label>
          <input
            type="text"
            className="input-field"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            className="input-field"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            className="input-field"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            required
          />

          <label>New Password (Optional)</label>
          <input
            type="password"
            className="input-field"
            placeholder="Leave blank to keep current password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
          />
          {userPassword && (
            <ul className="password-requirements">
                <li className={userPassword.length >= 8 ? 'req-met' : 'req-unmet'}>
                <span className="req-icon">{userPassword.length >= 8 ? '✓' : '✗'}</span> At least 8 characters
                </li>
                <li className={/[A-Z]/.test(userPassword) ? 'req-met' : 'req-unmet'}>
                <span className="req-icon">{/[A-Z]/.test(userPassword) ? '✓' : '✗'}</span> One uppercase letter
                </li>
                <li className={/[a-z]/.test(userPassword) ? 'req-met' : 'req-unmet'}>
                <span className="req-icon">{/[a-z]/.test(userPassword) ? '✓' : '✗'}</span> One lowercase letter
                </li>
                <li className={/\d/.test(userPassword) ? 'req-met' : 'req-unmet'}>
                <span className="req-icon">{/\d/.test(userPassword) ? '✓' : '✗'}</span> One number
                </li>
                <li className={/[@$!%*?&]/.test(userPassword) ? 'req-met' : 'req-unmet'}>
                <span className="req-icon">{/[@$!%*?&]/.test(userPassword) ? '✓' : '✗'}</span> One special character (@$!%*?&)
                </li>
            </ul>
          )}

          <button
            type="submit"
            className="btn-primary profile-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default EditProfilePage;
