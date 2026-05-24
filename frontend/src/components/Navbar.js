import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">

      {/* Logo */}
      <Link 
        to="/" 
        className="navbar-logo"
        onClick={() => {
          if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      >
        GK <span className="logo-accent">Cinemax</span>
      </Link>

      {/* Center links */}
      <div className="navbar-links">
        <Link 
          to="/" 
          className={location.pathname === '/' && location.hash !== '#about' && location.hash !== '#coming-soon' ? 'nav-link active' : 'nav-link'}
          onClick={(e) => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          Home
        </Link>

        <Link
          to="/#coming-soon"
          className={location.hash === '#coming-soon' ? 'nav-link active' : 'nav-link'}
          onClick={(e) => {
            if (location.pathname === '/') {
              const element = document.getElementById('coming-soon');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
        >
          Coming Soon
        </Link>

        <Link
          to="/#about"
          className={location.hash === '#about' ? 'nav-link active' : 'nav-link'}
          onClick={(e) => {
            if (location.pathname === '/') {
              const element = document.getElementById('about');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
        >
          Experience
        </Link>

        {!currentUser && (
          <>
            <Link to="/login"    className={location.pathname === '/login'    ? 'nav-link active' : 'nav-link'}>Login</Link>
            <Link to="/register" className={location.pathname === '/register' ? 'nav-link active' : 'nav-link'}>Register</Link>
          </>
        )}

        {currentUser && (
          currentUser.isAdmin
            ? <Link to="/admin"       className={location.pathname === '/admin'        ? 'nav-link active' : 'nav-link'}>Dashboard</Link>
            : <Link to="/my-bookings" className={location.pathname === '/my-bookings'  ? 'nav-link active' : 'nav-link'}>My Bookings</Link>
        )}
      </div>

      {/* Right: user */}
      <div className="navbar-right">
        {currentUser ? (
          <div className="nav-user">
            <Link to="/profile" className="nav-user-info">
              <span className="nav-user-label">Welcome,</span>
              <span className="nav-user-name">{currentUser.name}</span>
            </Link>

            <Link to="/profile" className="nav-avatar" aria-label="Profile">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </Link>

            <button className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-right-placeholder" />
        )}
      </div>

    </nav>
  );
}

export default Navbar;