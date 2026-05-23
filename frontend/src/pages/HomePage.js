import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/HomePage.css';

// The home page shows a grid of all currently showing movies
function HomePage() {

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
        <h1>🎬 GK Cinemax</h1>
        <p>Pandiruppu's Premier Cinema Experience</p>
      </div>

      {/* Now Showing section */}
      <h2 className="section-title">Now Showing</h2>

      {/* Show a message if no movies are in the database yet */}
      {movieList.length === 0 && (
        <div className="no-movies">No movies currently showing. Check back soon!</div>
      )}

      {/* Grid of movie cards */}
      <div className="movies-grid">
        {movieList.map((movie) => (

          // Each card links to that movie's detail page
          <Link to={`/movie/${movie._id}`} key={movie._id} className="movie-card">

            {/* Movie poster */}
            <img src={movie.posterUrl} alt={movie.title} />

            {/* Movie info below the poster */}
            <div className="movie-card-info">
              <h3>{movie.title}</h3>
              <p>{movie.language} • {formatDuration(movie.duration)}</p>
            </div>

          </Link>
        ))}
      </div>

    </div>
  );
}

export default HomePage;