import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import '../styles/HomePage.css';

// The home page shows a grid of all currently showing movies
function HomePage() {

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // movieList holds the array of movies from the backend
  const [movieList, setMovieList] = useState([]);

  // isLoading is true while we are waiting for the API response
  const [isLoading, setIsLoading] = useState(true);

  // errorMessage holds any error text to show the user
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch all movies from the backend when the page first loads
  useEffect(() => {
    fetchMovies();
  }, []);

  // Calls the backend API and saves the movie list to state
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

  // Converts duration in minutes to hours and minutes format
  function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  // Sends admin to edit page, sends regular user to movie details page
  function handleMovieCardClick(movieId) {
    if (currentUser && currentUser.isAdmin) {
      navigate(`/admin/movies/${movieId}`);
    } else {
      navigate(`/movie/${movieId}`);
    }
  }

  // Show a loading message while waiting for the API
  if (isLoading) {
    return <div className="loading">Loading movies...</div>;
  }

  // Show an error message if the API call failed
  if (errorMessage) {
    return <div className="error">{errorMessage}</div>;
  }

  return (
    <div>

      {/* Hero banner at the top */}
      <div className="hero">
        <h1>
          <span className="logo-gk">GK</span> 
          <span className="logo-cine">Cine</span>
          <span className="logo-max">max</span>
        </h1>
        <p>Pandiruppu's Premier Cinema Experience</p>
      </div>

      {/* Now Showing section */}
      <h2 className="section-title">Now Showing</h2>

      {/* Show a message if no movies are in the database yet */}
      {movieList.length === 0 && (
        <div className="no-movies">
          No movies currently showing. Check back soon!
        </div>
      )}

      {/* Grid of movie cards */}
      <div className="movies-grid">
        {movieList.map((movie, index) => (

          <div
            key={movie._id}
            className="movie-card"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleMovieCardClick(movie._id)}
          >

            {/* Movie poster container for zoom effect */}
            <div className="poster-container">
              <img src={movie.posterUrl} alt={movie.title} />
              <div className="poster-overlay">
                <span className="view-details-btn">View Details</span>
              </div>
            </div>

            {/* Movie info below the poster */}
            <div className="movie-card-info">
              <h3>{movie.title}</h3>
              <p className="movie-meta">
                <span className="language-badge">{movie.language}</span>
                <span className="duration">⏳ {formatDuration(movie.duration)}</span>
              </p>
            </div>

          </div>

        ))}
      </div>

    </div>
  );
}

export default HomePage;