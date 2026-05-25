import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/MoviePage.css';

// The movie page shows full details and all showtimes for one movie
function MoviePage() {

  // Get the movie id from the URL — example: /movie/664f1a2b...
  const { id } = useParams();
  const navigate = useNavigate();

  // movie holds the full movie details from the backend
  const [movie, setMovie] = useState(null);

  // showtimeList holds all showtimes for this movie
  const [showtimeList, setShowtimeList] = useState([]);

  // isLoading is true while waiting for both API calls
  const [isLoading, setIsLoading] = useState(true);

  // errorMessage holds any error to show the user
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch movie details and showtimes when the page first loads
  useEffect(() => {
    fetchMovieAndShowtimes();
  }, [id]);

  // Fetches the movie details and its showtimes from the backend
  async function fetchMovieAndShowtimes() {
    try {
      // Fetch movie details and showtimes at the same time
      const [movieResponse, showtimesResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/movies/${id}`),
        axios.get(`http://localhost:5000/api/showtimes?movieId=${id}`)
      ]);

      setMovie(movieResponse.data);
      setShowtimeList(showtimesResponse.data);

    } catch (error) {
      setErrorMessage('Failed to load movie details. Please try again.');
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

  // Formats a date string like "2024-06-20" to "Thu, 20 Jun 2024"
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Sends the user to the seat selection page for a chosen showtime
  function handleSelectSeats(showtimeId) {
    navigate(`/seats/${showtimeId}`);
  }

  if (isLoading) {
    return <div className="loading">Loading movie details...</div>;
  }

  if (errorMessage) {
    return <div className="error">{errorMessage}</div>;
  }

  if (!movie) {
    return <div className="error">Movie not found.</div>;
  }

  return (
    <div>

      {/* Top section — poster and details side by side */}
      <div className="movie-details">

        {/* Movie poster on the left */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-poster"
        />

        {/* Movie info on the right */}
        <div className="movie-info">

          <h1>{movie.title}</h1>

          {/* Language and duration badges */}
          <div className="movie-meta">
            <span className="meta-badge">🌐 {movie.language}</span>
            <span className="meta-badge">⏱ {formatDuration(movie.duration)}</span>
          </div>

          {/* Movie description */}
          <p className="movie-description">{movie.description}</p>

          {movie.comingSoon && movie.advanceBookingEnabled && (
            <div className="advance-booking-note" style={{
              background: 'rgba(212, 160, 23, 0.08)',
              border: '1px solid rgba(212, 160, 23, 0.25)',
              borderRadius: '10px',
              padding: '14px 16px',
              color: '#f5d27d',
              marginBottom: '24px'
            }}>
              Advance booking is open for this upcoming movie. Select a showtime below to pre-book your seats.
            </div>
          )}

        </div>
      </div>

      {/* Showtimes section below */}
      <div className="showtimes-section">
        <h2>Available Showtimes</h2>

        {/* Show message if no showtimes exist yet */}
        {showtimeList.length === 0 && (
          <div className="no-showtimes">
            No showtimes available for this movie yet.
          </div>
        )}

        {/* Grid of showtime cards */}
        <div className="showtimes-grid">
          {showtimeList.map((showtime) => (
            <div key={showtime._id} className="showtime-card">

              {/* Date */}
              <div className="showtime-date">
                📅 {formatDate(showtime.date)}
              </div>

              {/* Time shown large */}
              <div className="showtime-time">
                🕐 {showtime.time}
              </div>

              {/* Screen number */}
              <div className="showtime-screen">
                Screen {showtime.screen}
              </div>

              {/* Price */}
              <div className="showtime-price">
                LKR {showtime.price}
              </div>

              {/* Select seats button */}
              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={() => handleSelectSeats(showtime._id)}
              >
                Select Seats
              </button>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default MoviePage;