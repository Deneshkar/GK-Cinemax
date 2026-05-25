import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/SeatPage.css';

function SeatPage() {

  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [showtime, setShowtime]         = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => { fetchShowtime(); }, [showtimeId]);

  async function fetchShowtime() {
    try {
      const response = await axios.get(`http://localhost:5000/api/showtimes/${showtimeId}`);
      setShowtime(response.data);
    } catch (error) {
      setErrorMessage('Failed to load showtime. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function buildAllSeats() {
    const rows = ['A','B','C','D','E','F','G','H','I','J'];
    return rows.map(r => Array.from({ length: 10 }, (_, i) => `${r}${i + 1}`));
  }

  function handleSeatClick(seat) {
    if (showtime.bookedSeats.includes(seat)) return;
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
      return;
    }
    if (selectedSeats.length >= 10) {
      alert('You can only select up to 10 seats at a time.');
      return;
    }
    setSelectedSeats([...selectedSeats, seat]);
  }

  function getSeatStatus(seat) {
    if (showtime.bookedSeats.includes(seat)) return 'booked';
    if (selectedSeats.includes(seat)) return 'selected';
    return 'available';
  }

  function calculateTotal() {
    return selectedSeats.length * showtime.price;
  }

  async function handleProceedToPay() {
    if (!currentUser) { navigate('/login'); return; }
    if (selectedSeats.length === 0) { alert('Please select at least one seat.'); return; }
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('gkToken');
      const totalPrice = calculateTotal();
      const orderResponse = await axios.post(
        'http://localhost:5000/api/payment/create-order',
        { totalPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { orderId, amount, currency, keyId } = orderResponse.data;
      const options = {
        key: keyId, amount, currency,
        name: 'GK Cinemax',
        description: `${showtime.movieId.title} — ${selectedSeats.join(', ')}`,
        order_id: orderId,
        handler: async function (res) {
          await axios.post('http://localhost:5000/api/payment/verify', {
            razorpayOrderId: res.razorpay_order_id,
            razorpayPaymentId: res.razorpay_payment_id,
            razorpaySignature: res.razorpay_signature
          }, { headers: { Authorization: `Bearer ${token}` } });
          await axios.post('http://localhost:5000/api/bookings', {
            showtimeId, seats: selectedSeats, totalPrice,
            razorpayPaymentId: res.razorpay_payment_id
          }, { headers: { Authorization: `Bearer ${token}` } });
          alert('Booking confirmed! Check your email for the QR code.');
          navigate('/my-bookings');
        },
        prefill: { name: currentUser.name, email: currentUser.email },
        theme: { color: '#D4AA5F' }
      };
      const rp = new window.Razorpay(options);
      rp.open();
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) return (
    <div className="seat-loading">
      <div className="seat-reel">
        <div className="sr-dot"></div><div className="sr-dot"></div><div className="sr-dot"></div>
      </div>
      <p>Loading seats…</p>
    </div>
  );

  if (errorMessage) return (
    <div className="seat-error"><span>⚠</span><p>{errorMessage}</p></div>
  );

  const allRows = buildAllSeats();
  const bookedCount   = showtime.bookedSeats.length;
  const availableCount = 100 - bookedCount;

  return (
    <div className="seat-page">

      {/* ── Showtime header ──────────────────────────────── */}
      <div className="seat-header">
        <div className="seat-header-inner">
          <div>
            <p className="seat-eyebrow">Now Showing</p>
            <h1 className="seat-movie-title">{showtime.movieId.title}</h1>
            <div className="seat-meta-row">
              <span className="seat-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {showtime.date}
              </span>
              <span className="seat-meta-sep" aria-hidden="true">·</span>
              <span className="seat-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {showtime.time}
              </span>
              <span className="seat-meta-sep" aria-hidden="true">·</span>
              <span className="seat-meta-item">Screen {showtime.screen}</span>
              <span className="seat-meta-sep" aria-hidden="true">·</span>
              <span className="seat-meta-item seat-price-tag">LKR {showtime.price} / seat</span>
            </div>
          </div>
          <div className="seat-avail-badge">
            <span className="avail-num">{availableCount}</span>
            <span className="avail-label">seats left</span>
          </div>
        </div>
      </div>

      <div className="seat-body">
        <div className="seat-main">

          {/* ── Screen ──────────────────────────────────── */}
          <div className="screen-wrap" aria-label="Cinema screen">
            <div className="screen-bar"></div>
            <p className="screen-label">SCREEN</p>
          </div>

          {/* ── Seat grid ───────────────────────────────── */}
          <div className="seat-grid" role="group" aria-label="Seat selection">
            {allRows.map((row, ri) => (
              <div key={ri} className="seat-row">
                <span className="row-label" aria-hidden="true">{row[0][0]}</span>
                <div className="row-seats">
                  {row.map(seat => {
                    const status = getSeatStatus(seat);
                    return (
                      <button
                        key={seat}
                        className={`seat seat-${status}`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={status === 'booked'}
                        aria-label={`Seat ${seat} — ${status}`}
                        aria-pressed={status === 'selected'}
                        title={seat}
                      >
                        <span className="seat-num">{seat.slice(1)}</span>
                      </button>
                    );
                  })}
                </div>
                <span className="row-label" aria-hidden="true">{row[0][0]}</span>
              </div>
            ))}
          </div>

          {/* ── Legend ──────────────────────────────────── */}
          <div className="seat-legend">
            <div className="legend-item">
              <div className="legend-swatch seat-available" aria-hidden="true"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-swatch seat-selected" aria-hidden="true"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="legend-swatch seat-booked" aria-hidden="true"></div>
              <span>Booked</span>
            </div>
          </div>

        </div>

        {/* ── Summary panel ───────────────────────────── */}
        <aside className="booking-panel">
          <div className="panel-rule" aria-hidden="true"></div>

          <p className="panel-label">Booking Summary</p>
          <h2 className="panel-movie">{showtime.movieId.title}</h2>

          <div className="panel-info-block">
            <div className="panel-info-row">
              <span>Date</span>
              <span>{showtime.date}</span>
            </div>
            <div className="panel-info-row">
              <span>Time</span>
              <span>{showtime.time}</span>
            </div>
            <div className="panel-info-row">
              <span>Screen</span>
              <span>Screen {showtime.screen}</span>
            </div>
          </div>

          <div className="panel-divider" aria-hidden="true"></div>

          {selectedSeats.length === 0 ? (
            <p className="panel-empty">Select seats from the grid to continue.</p>
          ) : (
            <div className="panel-seats-block">
              <p className="panel-seats-label">Selected seats</p>
              <div className="panel-seat-chips">
                {[...selectedSeats].sort().map(s => (
                  <span key={s} className="panel-chip">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="panel-divider" aria-hidden="true"></div>

          <div className="panel-calc">
            {selectedSeats.length > 0 && (
              <>
                <div className="panel-calc-row">
                  <span>{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}</span>
                  <span>× LKR {showtime.price}</span>
                </div>
              </>
            )}
            <div className="panel-total-row">
              <span>Total</span>
              <span className="panel-total-val">
                LKR {calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>

          <button
            className="panel-pay-btn"
            onClick={handleProceedToPay}
            disabled={isProcessing || selectedSeats.length === 0}
          >
            {isProcessing
              ? 'Processing…'
              : selectedSeats.length === 0
                ? 'Select seats to continue'
                : 'Proceed to Pay'}
          </button>

          <p className="panel-note">Secure payment via Razorpay</p>

        </aside>
      </div>
    </div>
  );
}

export default SeatPage;