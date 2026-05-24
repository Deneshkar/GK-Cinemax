import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import ComingSoonPage from './ComingSoonPage';
import '../styles/HomePage.css';

function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (!isLoading && location.hash) {
      setTimeout(() => {
        const element = document.getElementById(location.hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [isLoading, location.hash]);

  async function fetchMovies() {
    try {
      const response = await axios.get('http://localhost:5000/api/movies');
      setMovieList(response.data);
    } catch (error) {
      setErrorMessage('Failed to load movies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  function handleMovieCardClick(movieId) {
    if (currentUser && currentUser.isAdmin) {
      navigate(`/admin/movies/${movieId}`);
    } else {
      navigate(`/movie/${movieId}`);
    }
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="film-reel">
          <div className="reel-hole"></div>
          <div className="reel-hole"></div>
          <div className="reel-hole"></div>
        </div>
        <p className="loading-text">Cueing the experience<span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span></p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="error-screen">
        <span className="error-icon">⚠</span>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="home-container">

      {/* Grain Overlay */}
      <div className="grain-overlay" aria-hidden="true"></div>

      {/* Hero */}
      <header className="hero">
        <div className="hero-backdrop" aria-hidden="true">
          <div className="spotlight spotlight-left"></div>
          <div className="spotlight spotlight-right"></div>
          <div className="scanlines"></div>
        </div>
        <div className="hero-content">
          <p className="hero-eyebrow">
            <span className="eyebrow-line"></span>
            Pandiruppu · Est. 2020
            <span className="eyebrow-line"></span>
          </p>
          <h1 className="hero-title">
            <span className="title-gk">GK</span>
            <span className="title-separator"> </span>
            <span className="title-cinemax">Cinemax</span>
          </h1>
          <p className="hero-tagline">Where every frame becomes a memory.</p>
          <div className="hero-actions">
            <a href="#now-showing" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Now Showing
            </a>
            <a href="#about" className="btn-ghost">Our Experience</a>
          </div>
        </div>
        <div className="hero-scroll-hint" aria-hidden="true">
          <div className="scroll-line"></div>
          <span>scroll</span>
        </div>
      </header>

      <main>
        {/* Now Showing */}
        <section className="section movies-section" id="now-showing">
          <div className="section-intro">
            <div className="section-label">On Screen</div>
            <h2 className="section-heading">Now Showing</h2>
          </div>

          {movieList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">🎬</div>
              <p>The curtain rests. New features arriving soon.</p>
            </div>
          ) : (
            <div className="movies-grid">
              {movieList.map((movie, index) => (
                <article
                  key={movie._id}
                  className="movie-card"
                  style={{ '--delay': `${index * 0.07}s` }}
                  onMouseEnter={() => setActiveCard(movie._id)}
                  onMouseLeave={() => setActiveCard(null)}
                  onClick={() => handleMovieCardClick(movie._id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleMovieCardClick(movie._id)}
                  role="button"
                  aria-label={`${movie.title} – ${formatDuration(movie.duration)}`}
                >
                  <div className="card-poster-wrap">
                    <img
                      className="card-poster"
                      src={movie.posterUrl}
                      alt={movie.title}
                      loading="lazy"
                    />
                    <div className="card-vignette"></div>
                  </div>

                  <div className="card-info">
                    <span className="card-lang-badge">{movie.language}</span>
                    <h3 className="card-title">{movie.title}</h3>
                    <p className="card-meta">{formatDuration(movie.duration)}</p>
                    <button className="card-cta" tabIndex={-1} aria-hidden="true">
                      Book Seats
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Coming Soon section */}
          <ComingSoonPage />

        </section>

        {/* About / Experience */}
        <section className="section experience-section" id="about">
          <div className="experience-inner">
            <div className="experience-text">
              <div className="section-label">The GK Difference</div>
              <h2 className="section-heading">Beyond the<br/>ordinary screen</h2>
              <p className="experience-body">
                Every detail at GK Cinemax is engineered for a single purpose — 
                to make you forget the world outside exists.
              </p>
            </div>
            <div className="features-list">
              {[
                { icon: '📽', label: '4K Laser Projection', desc: 'Crisp, true-to-life visuals at every angle.' },
                { icon: '🔊', label: 'Dolby Atmos Sound', desc: 'Audio that moves with the story.' },
                { icon: '💺', label: 'Luxury Recliners', desc: 'Sink in. Stay as long as you like.' },
                { icon: '🍿', label: 'Gourmet Concessions', desc: 'Elevated snacks and artisan drinks.' },
              ].map((f, i) => (
                <div className="feature-item" key={i} style={{ '--f-delay': `${i * 0.1}s` }}>
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-text">
                    <h4>{f.label}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <p className="footer-logo">GK <span>Cinemax</span></p>
            <p className="footer-brand-tagline">Pandiruppu's ultimate cinematic escape.</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <div className="footer-nav-col">
              <h5>Discover</h5>
              <Link to="#">Now Showing</Link>
              <Link to="#">Coming Soon</Link>
              <Link to="#">Pricing</Link>
            </div>
            <div className="footer-nav-col">
              <h5>Help</h5>
              <Link to="#">Contact Us</Link>
              <Link to="#">FAQ</Link>
              <Link to="#">Privacy</Link>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© 2026 GK Cinemax. All rights reserved.</p>
          <div className="footer-divider-strip" aria-hidden="true">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="strip-tick"></div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// A mini coming soon section shown at the bottom of the home page
function ComingSoonSection() {

  const [upcomingMovies, setUpcomingMovies] = useState([]);

  useEffect(() => {
    fetchUpcoming();
  }, []);

  async function fetchUpcoming() {
    try {
      const response = await axios.get('http://localhost:5000/api/movies/coming-soon');
      setUpcomingMovies(response.data);
    } catch (error) {
      // Silently fail — coming soon section is not critical
      console.log('Could not load coming soon movies');
    }
  }

  // Do not show the section at all if there are no upcoming movies
  if (upcomingMovies.length === 0) return null;

  return (
    <div style={{ marginTop: '50px' }}>

      {/* Section heading in gold */}
      <h2 className="section-title" style={{ borderColor: '#d4a017', color: '#d4a017' }}>
        Coming Soon
      </h2>

      <div className="movies-grid">
        {upcomingMovies.map((movie) => (
          <div key={movie._id} className="movie-card" style={{ cursor: 'default' }}>

            {/* Poster with slight dim */}
            <img
              src={movie.posterUrl}
              alt={movie.title}
              style={{ filter: 'brightness(0.75)' }}
            />

            <div className="movie-card-info">

              {/* Golden coming soon badge */}
              <span style={{
                background: '#d4a017',
                color: '#000',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 8px',
                borderRadius: '10px',
                letterSpacing: '1px',
                marginBottom: '6px',
                display: 'inline-block'
              }}>
                COMING SOON
              </span>

              <h3>{movie.title}</h3>
              <p>{movie.language}</p>

              {/* Release date if available */}
              {movie.releaseDate && (
                <p style={{ color: '#d4a017', fontSize: '12px', marginTop: '4px' }}>
                  🗓 {new Date(movie.releaseDate).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;