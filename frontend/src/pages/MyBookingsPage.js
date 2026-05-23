import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/MyBookingsPage.css';

// The my bookings page shows all past bookings for the logged in user
function MyBookingsPage() {

  // myBookings holds the list of bookings from the backend
  const [myBookings, setMyBookings] = useState([]);

  // isLoading is true while fetching bookings
  const [isLoading, setIsLoading] = useState(true);

  // errorMessage holds any error to show the user
  const [errorMessage, setErrorMessage] = useState('');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if the user is not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchMyBookings();
  }, [currentUser]);

  // Fetches all bookings for the currently logged in user
  async function fetchMyBookings() {
    try {
      const token = localStorage.getItem('gkToken');
      const response = await axios.get('http://localhost:5000/api/bookings/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyBookings(response.data);
    } catch (error) {
      setErrorMessage('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Formats a date string like "2024-06-20" to "Thu, 20 Jun 2024"
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  if (isLoading) {
    return <div className="loading">Loading your bookings...</div>;
  }

  if (errorMessage) {
    return <div className="error">{errorMessage}</div>;
  }

  return (
    <div>

      {/* Page title */}
      <h2 className="bookings-title">My Bookings</h2>

      {/* Show message if user has no bookings yet */}
      {myBookings.length === 0 && (
        <div className="no-bookings">
          <p>You have no bookings yet.</p>
          <Link to="/" className="btn-primary">Browse Movies</Link>
        </div>
      )}

      {/* List of booking cards */}
      {myBookings.map((booking) => (
        <div key={booking._id} className="booking-card">

          {/* Left side — booking details */}
          <div className="booking-info">

            {/* Movie title */}
            <div className="booking-movie-title">
              🎬 {booking.showtimeId?.movieId?.title || 'Movie'}
            </div>

            {/* Date */}
            <div className="booking-detail">
              📅 {formatDate(booking.showtimeId?.date)}
            </div>

            {/* Time */}
            <div className="booking-detail">
              🕐 {booking.showtimeId?.time}
            </div>

            {/* Screen */}
            <div className="booking-detail">
              🎭 Screen {booking.showtimeId?.screen}
            </div>

            {/* Seat badges */}
            <div className="booking-seats">
              {booking.seats.map((seat) => (
                <span key={seat} className="seat-badge">{seat}</span>
              ))}
            </div>

            {/* Total price */}
            <div className="booking-total">
              LKR {booking.totalPrice}
            </div>

            {/* Payment status badge */}
            <div>
              <span className="status-paid">✓ Paid</span>
            </div>

          </div>

          {/* Right side — QR code */}
          <div className="booking-qr">
            <img
              src={booking.qrCode}
              alt="Booking QR Code"
            />
            <p>Show at entrance</p>
          </div>

        </div>
      ))}

    </div>
  );
}

export default MyBookingsPage;