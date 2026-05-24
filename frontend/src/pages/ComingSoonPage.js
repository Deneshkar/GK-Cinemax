import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/ComingSoonPage.css';

// Shows all upcoming movies that are not yet showing
function ComingSoonPage() {

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [errorMessage, setErrorMessage]     = useState('');

  useEffect(() => {
    fetchUpcomingMovies();
  }, []);

  // Fetches all movies marked as coming soon from the backend
  async function fetchUpcomingMovies() {
    try {
      const response = await axios.get('http://localhost:5000/api/movies/coming-soon');
      setUpcomingMovies(response.data);
    } catch (error) {
      setErrorMessage('Failed to load upcoming movies.');
    } finally {
      setIsLoading(false);
    }
  }

  // Converts duration in minutes to hours and minutes
  function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins  = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  // Formats a date string to a readable format
  function formatReleaseDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function handleMovieCardClick(movieId) {
    if (currentUser && currentUser.isAdmin) {
      navigate(`/admin/movies/${movieId}`);
    } else {
      navigate(`/movie/${movieId}`); // or maybe a coming-soon detail page, but at least admin can edit!
    }
  }

  if (isLoading) return <div className="loading">Loading upcoming movies...</div>;
  if (errorMessage) return <div className="error">{errorMessage}</div>;

  return (
    <div>
      <h2 className="coming-soon-title">Coming Soon</h2>
      <p className="coming-soon-subtitle">
        Upcoming films arriving at GK Cinemax, Pandiruppu
      </p>

      {upcomingMovies.length === 0 && (
        <div className="no-coming-soon">
          No upcoming movies announced yet. Check back soon!
        </div>
      )}

      <div className="coming-soon-grid">
        {upcomingMovies.map((movie) => (
          <div 
            key={movie._id} 
            className="coming-soon-card"
            onClick={() => handleMovieCardClick(movie._id)}
            style={{ cursor: 'pointer' }}
          >

            {/* Poster */}
            <img src={movie.posterUrl} alt={movie.title} />

            {/* Info */}
            <div className="coming-soon-info">

              <div className="coming-soon-badge">COMING SOON</div>

              <h3>{movie.title}</h3>

              <p className="meta">
                {movie.language} • {formatDuration(movie.duration)}
              </p>

              <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.5' }}>
                {movie.description}
              </p>

              {/* Show release date if set */}
              {movie.releaseDate && (
                <p className="release-date">
                  🗓 Releasing {formatReleaseDate(movie.releaseDate)}
                </p>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComingSoonPage;