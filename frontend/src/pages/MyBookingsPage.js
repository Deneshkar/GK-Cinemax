import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/MyBookingsPage.css';

function MyBookingsPage() {

  const [myBookings, setMyBookings] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    fetchMyBookings();
  }, [currentUser]);

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

  async function handleCancelRequest(bookingId) {
    if (!window.confirm('Request a cancellation? Amount will be refunded upon admin approval.')) return;
    try {
      const token = localStorage.getItem('gkToken');
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel-request`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to request cancellation.');
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  if (isLoading) {
    return (
      <div className="bookings-loading">
        <div className="bookings-reel">
          <div className="reel-dot"></div>
          <div className="reel-dot"></div>
          <div className="reel-dot"></div>
        </div>
        <p>Loading your bookings…</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="bookings-error">
        <span>⚠</span>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="bookings-page">

      {/* Header */}
      <div className="bookings-header">
        <p className="bookings-eyebrow">Your Account</p>
        <h1 className="bookings-title">My Bookings</h1>
        {myBookings.length > 0 && (
          <p className="bookings-count">{myBookings.length} reservation{myBookings.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Empty state */}
      {myBookings.length === 0 && (
        <div className="bookings-empty">
          <div className="empty-icon">🎬</div>
          <h3>No bookings yet</h3>
          <p>Your reserved seats will appear here.</p>
          <Link to="/" className="empty-cta">Browse Now Showing</Link>
        </div>
      )}

      {/* Cards */}
      <div className="bookings-list">
        {myBookings.map((booking, index) => {
          const cs = booking.cancelStatus;
          const ps = booking.paymentStatus;

          return (
            <article
              key={booking._id}
              className="booking-card"
              style={{ '--card-delay': `${index * 0.07}s` }}
            >
              {/* Left: details */}
              <div className="booking-info">

                <div className="booking-card-top">
                  <h2 className="booking-movie">
                    {booking.showtimeId?.movieId?.title || 'Untitled Film'}
                  </h2>
                  {/* Status badge */}
                  {ps === 'paid' && cs === 'none'   && <span className="status-badge paid">Confirmed</span>}
                  {cs === 'requested'               && <span className="status-badge pending">Cancel Pending</span>}
                  {cs === 'refunded'                && <span className="status-badge refunded">Refunded</span>}
                  {cs === 'rejected'                && <span className="status-badge rejected">Req. Rejected</span>}
                </div>

                <div className="booking-meta">
                  <div className="meta-item">
                    <span className="meta-label">Date</span>
                    <span className="meta-value">{formatDate(booking.showtimeId?.date)}</span>
                  </div>
                  <div className="meta-divider" aria-hidden="true"></div>
                  <div className="meta-item">
                    <span className="meta-label">Time</span>
                    <span className="meta-value">{booking.showtimeId?.time || 'N/A'}</span>
                  </div>
                  <div className="meta-divider" aria-hidden="true"></div>
                  <div className="meta-item">
                    <span className="meta-label">Screen</span>
                    <span className="meta-value">
                      {booking.showtimeId ? `S${booking.showtimeId.screen}` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="booking-seats-row">
                  <span className="meta-label">Seats</span>
                  <div className="seat-chips">
                    {booking.seats.map((seat) => (
                      <span key={seat} className="seat-chip">{seat}</span>
                    ))}
                  </div>
                </div>

                <div className="booking-footer">
                  <div className="booking-price">
                    <span className="price-label">Total</span>
                    <span className="price-value">LKR {booking.totalPrice.toLocaleString()}</span>
                  </div>

                  {cs === 'none' && ps === 'paid' && (
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelRequest(booking._id)}
                    >
                      Request Cancellation
                    </button>
                  )}
                </div>

              </div>

              {/* Perforated divider */}
              <div className="ticket-perforation" aria-hidden="true">
                <div className="perf-notch top"></div>
                <div className="perf-line"></div>
                <div className="perf-notch bottom"></div>
              </div>

              {/* Right: QR */}
              <div className="booking-qr">
                <div className="qr-wrap">
                  <img src={booking.qrCode} alt="Booking QR Code" />
                </div>
                <p className="qr-label">Show at entrance</p>
              </div>

            </article>
          );
        })}
      </div>

    </div>
  );
}

export default MyBookingsPage;