import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/AdminDashboard.css';

// The admin dashboard — only accessible by admin users
function AdminDashboard() {

  // activeTab controls which section is shown
  const [activeTab, setActiveTab] = useState('addMovie');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect away if the user is not an admin
  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate('/');
    }
  }, [currentUser]);

  return (
    <div>
      <h2 className="admin-title">Admin Dashboard</h2>

      {/* Tab buttons */}
      <div className="admin-tabs">
        <button
          className={activeTab === 'addMovie' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('addMovie')}
        >
          Add Movie
        </button>
        <button
          className={activeTab === 'addShowtime' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('addShowtime')}
        >
          Add Showtime
        </button>
        <button
          className={activeTab === 'allBookings' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('allBookings')}
        >
          All Bookings
        </button>
      </div>

      {/* Show the correct section based on active tab */}
      {activeTab === 'addMovie'    && <AddMovieForm />}
      {activeTab === 'addShowtime' && <AddShowtimeForm />}
      {activeTab === 'allBookings' && <AllBookingsTable />}

    </div>
  );
}

// ─────────────────────────────────────────
// ADD MOVIE FORM
// ─────────────────────────────────────────

// Form that lets the admin add a new movie with a poster image
function AddMovieForm() {

  // Form field values
  const [movieTitle, setMovieTitle]           = useState('');
  const [movieLanguage, setMovieLanguage]     = useState('');
  const [movieDuration, setMovieDuration]     = useState('');
  const [movieDescription, setMovieDescription] = useState('');
  const [posterFile, setPosterFile]           = useState(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage]     = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);

  // Handles the add movie form submission
  async function handleAddMovie(event) {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Make sure a poster image was selected
    if (!posterFile) {
      setErrorMessage('Please select a poster image.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('gkToken');

      // Use FormData because we are sending a file along with text fields
      const formData = new FormData();
      formData.append('title',       movieTitle);
      formData.append('language',    movieLanguage);
      formData.append('duration',    movieDuration);
      formData.append('description', movieDescription);
      formData.append('poster',      posterFile);

      await axios.post('http://localhost:5000/api/movies', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage(`"${movieTitle}" added successfully!`);

      // Clear all form fields after success
      setMovieTitle('');
      setMovieLanguage('');
      setMovieDuration('');
      setMovieDescription('');
      setPosterFile(null);

    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to add movie.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-form-card">
      <h3>Add New Movie</h3>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage   && <div className="admin-error">{errorMessage}</div>}

      <form onSubmit={handleAddMovie}>

        <label>Movie Title</label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g. Vettaiyan"
          value={movieTitle}
          onChange={(e) => setMovieTitle(e.target.value)}
          required
        />

        <label>Language</label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g. Tamil, Sinhala, English"
          value={movieLanguage}
          onChange={(e) => setMovieLanguage(e.target.value)}
          required
        />

        <label>Duration (minutes)</label>
        <input
          type="number"
          className="input-field"
          placeholder="e.g. 150"
          value={movieDuration}
          onChange={(e) => setMovieDuration(e.target.value)}
          required
        />

        <label>Description</label>
        <textarea
          className="input-field"
          placeholder="Short description of the movie..."
          value={movieDescription}
          onChange={(e) => setMovieDescription(e.target.value)}
          rows={4}
          required
        />

        <label>Poster Image</label>
        <input
          type="file"
          className="file-input"
          accept="image/*"
          onChange={(e) => setPosterFile(e.target.files[0])}
        />

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Uploading...' : 'Add Movie'}
        </button>

      </form>
    </div>
  );
}

// ─────────────────────────────────────────
// ADD SHOWTIME FORM
// ─────────────────────────────────────────

// Form that lets the admin add a showtime for an existing movie
function AddShowtimeForm() {

  // movieList holds all movies to populate the dropdown
  const [movieList, setMovieList]             = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [screenNumber, setScreenNumber]       = useState('1');
  const [showDate, setShowDate]               = useState('');
  const [showTime, setShowTime]               = useState('');
  const [ticketPrice, setTicketPrice]         = useState('600');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage]     = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);

  // Fetch all movies when this form loads so we can show them in a dropdown
  useEffect(() => {
    fetchMovies();
  }, []);

  // Fetches all movies to populate the movie dropdown
  async function fetchMovies() {
    try {
      const response = await axios.get('http://localhost:5000/api/movies');
      setMovieList(response.data);
    } catch (error) {
      setErrorMessage('Failed to load movies.');
    }
  }

  // Handles the add showtime form submission
  async function handleAddShowtime(event) {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('gkToken');

      await axios.post(
        'http://localhost:5000/api/showtimes',
        {
          movieId: selectedMovieId,
          screen:  Number(screenNumber),
          date:    showDate,
          time:    showTime,
          price:   Number(ticketPrice)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage('Showtime added successfully!');

      // Clear form after success
      setSelectedMovieId('');
      setScreenNumber('1');
      setShowDate('');
      setShowTime('');
      setTicketPrice('600');

    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to add showtime.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-form-card">
      <h3>Add New Showtime</h3>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage   && <div className="admin-error">{errorMessage}</div>}

      <form onSubmit={handleAddShowtime}>

        {/* Movie dropdown */}
        <label>Movie</label>
        <select
          className="input-field"
          value={selectedMovieId}
          onChange={(e) => setSelectedMovieId(e.target.value)}
          required
        >
          <option value="">-- Select a movie --</option>
          {movieList.map((movie) => (
            <option key={movie._id} value={movie._id}>
              {movie.title} ({movie.language})
            </option>
          ))}
        </select>

        {/* Screen dropdown */}
        <label>Screen</label>
        <select
          className="input-field"
          value={screenNumber}
          onChange={(e) => setScreenNumber(e.target.value)}
        >
          <option value="1">Screen 1</option>
          <option value="2">Screen 2</option>
        </select>

        {/* Date picker */}
        <label>Date</label>
        <input
          type="date"
          className="input-field"
          value={showDate}
          onChange={(e) => setShowDate(e.target.value)}
          required
        />

        {/* Time picker */}
        <label>Time</label>
        <input
          type="time"
          className="input-field"
          value={showTime}
          onChange={(e) => setShowTime(e.target.value)}
          required
        />

        {/* Price field */}
        <label>Ticket Price (LKR)</label>
        <input
          type="number"
          className="input-field"
          value={ticketPrice}
          onChange={(e) => setTicketPrice(e.target.value)}
          required
        />

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Showtime'}
        </button>

      </form>
    </div>
  );
}

// ─────────────────────────────────────────
// ALL BOOKINGS TABLE
// ─────────────────────────────────────────

// Table that shows every booking made — admin only
function AllBookingsTable() {

  // allBookings holds every booking from the backend
  const [allBookings, setAllBookings] = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch all bookings when this tab loads
  useEffect(() => {
    fetchAllBookings();
  }, []);

  // Fetches all bookings from the backend
  async function fetchAllBookings() {
    try {
      const token = localStorage.getItem('gkToken');
      const response = await axios.get('http://localhost:5000/api/bookings/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllBookings(response.data);
    } catch (error) {
      setErrorMessage('Failed to load bookings.');
    } finally {
      setIsLoading(false);
    }
  }

  // Calculates total revenue by adding up all booking prices
  function calculateTotalRevenue() {
    return allBookings.reduce((total, booking) => total + booking.totalPrice, 0);
  }

  if (isLoading) return <div className="loading">Loading bookings...</div>;
  if (errorMessage) return <div className="error">{errorMessage}</div>;

  return (
    <div>

      {/* Revenue summary card */}
      <div className="revenue-card">
        <div>
          <h3>Total Revenue</h3>
          <p style={{ color: '#666', fontSize: '13px' }}>
            From {allBookings.length} booking{allBookings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="revenue-amount">
          LKR {calculateTotalRevenue().toLocaleString()}
        </div>
      </div>

      {/* No bookings message */}
      {allBookings.length === 0 && (
        <div className="no-bookings-admin">No bookings have been made yet.</div>
      )}

      {/* Bookings table */}
      {allBookings.length > 0 && (
        <div className="bookings-table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Movie</th>
                <th>Date & Time</th>
                <th>Screen</th>
                <th>Seats</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allBookings.map((booking) => (
                <tr key={booking._id}>

                  {/* Customer name and email */}
                  <td>
                    <div>{booking.userId?.name}</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {booking.userId?.email}
                    </div>
                  </td>

                  {/* Movie title */}
                  <td>{booking.showtimeId?.movieId?.title}</td>

                  {/* Date and time */}
                  <td>
                    <div>{booking.showtimeId?.date}</div>
                    <div style={{ color: '#666' }}>{booking.showtimeId?.time}</div>
                  </td>

                  {/* Screen number */}
                  <td>Screen {booking.showtimeId?.screen}</td>

                  {/* Seats */}
                  <td>{booking.seats.join(', ')}</td>

                  {/* Total price */}
                  <td style={{ color: '#e50914', fontWeight: 'bold' }}>
                    LKR {booking.totalPrice}
                  </td>

                  {/* Payment status */}
                  <td>
                    <span style={{
                      background: '#16a34a',
                      color: 'white',
                      padding: '2px 10px',
                      borderRadius: '20px',
                      fontSize: '12px'
                    }}>
                      {booking.paymentStatus}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;