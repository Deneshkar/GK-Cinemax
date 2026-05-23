import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/Navbar.css';

// The navbar shown at the top of every page
function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Logs the user out and sends them to the home page
  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">

      {/* Logo on the left */}
      <Link to="/" className="navbar-logo">
        🎬 GK Cinemax
      </Link>

      {/* Links on the right */}
      <div className="navbar-links">

        <Link to="/">Home</Link>

        {/* Show these links only if the user is NOT logged in */}
        {!currentUser && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {/* Show these links only if the user IS logged in */}
        {currentUser && (
          <>
            {/* Admin sees Dashboard, regular user sees My Bookings */}
            {currentUser.isAdmin
              ? <Link to="/admin">Dashboard</Link>
              : <Link to="/my-bookings">My Bookings</Link>
            }

            <span className="navbar-username">
              Hi, {currentUser.name}
            </span>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

      </div>
    </nav>
  );
}

export default Navbar;