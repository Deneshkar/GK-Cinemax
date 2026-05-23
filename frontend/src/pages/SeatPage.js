import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/SeatPage.css';

// The seat page shows a 100-seat grid and lets the user pick their seats
function SeatPage() {

  // Get the showtime id from the URL
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // showtime holds the full showtime and movie details
  const [showtime, setShowtime] = useState(null);

  // selectedSeats holds the seats the user has clicked to choose
  const [selectedSeats, setSelectedSeats] = useState([]);

  // isLoading is true while fetching the showtime
  const [isLoading, setIsLoading] = useState(true);

  // errorMessage holds any error to show the user
  const [errorMessage, setErrorMessage] = useState('');

  // isProcessing is true while payment is being handled
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch showtime details when the page first loads
  useEffect(() => {
    fetchShowtime();
  }, [showtimeId]);

  // Fetches the showtime from the backend including already booked seats
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

  // Builds the list of all 100 seat labels — A1 to J10
  function buildAllSeats() {
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const allSeats = [];
    for (const rowLetter of rowLetters) {
      const rowSeats = [];
      for (let seatNumber = 1; seatNumber <= 10; seatNumber++) {
        rowSeats.push(`${rowLetter}${seatNumber}`);
      }
      allSeats.push(rowSeats);
    }
    return allSeats;
  }

  // Handles clicking on a seat — selects or deselects it
  function handleSeatClick(seatLabel) {

    // Do nothing if the seat is already booked by someone else
    if (showtime.bookedSeats.includes(seatLabel)) {
      return;
    }

    // If the seat is already selected, remove it from selection
    if (selectedSeats.includes(seatLabel)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatLabel));
      return;
    }

    // If the user already selected 10 seats, stop them from picking more
    if (selectedSeats.length >= 10) {
      alert('You can only select up to 10 seats at a time.');
      return;
    }

    // Add the seat to the selection
    setSelectedSeats([...selectedSeats, seatLabel]);
  }

  // Returns the CSS class for a seat based on its status
  function getSeatClass(seatLabel) {
    if (showtime.bookedSeats.includes(seatLabel)) return 'seat booked';
    if (selectedSeats.includes(seatLabel)) return 'seat selected';
    return 'seat available';
  }

  // Calculates the total price based on number of selected seats
  function calculateTotal() {
    return selectedSeats.length * showtime.price;
  }

  // Handles the payment flow when user clicks Proceed to Pay
  async function handleProceedToPay() {

    // If user is not logged in, send them to the login page first
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Make sure at least one seat is selected
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('gkToken');
      const totalPrice = calculateTotal();

      // Step 1 — Create a Razorpay order on the backend
      const orderResponse = await axios.post(
        'http://localhost:5000/api/payment/create-order',
        { totalPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, keyId } = orderResponse.data;

      // Step 2 — Open the Razorpay payment popup
      const razorpayOptions = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'GK Cinemax',
        description: `${showtime.movieId.title} — ${selectedSeats.join(', ')}`,
        order_id: orderId,

        // Step 3 — This runs after the user successfully pays
        handler: async function (paymentResponse) {

          // Verify the payment on the backend
          await axios.post(
            'http://localhost:5000/api/payment/verify',
            {
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Save the booking to the database
          await axios.post(
            'http://localhost:5000/api/bookings',
            {
              showtimeId: showtimeId,
              seats: selectedSeats,
              totalPrice: totalPrice,
              razorpayPaymentId: paymentResponse.razorpay_payment_id
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Send the user to their bookings page
          alert('Booking confirmed! Check your email for the QR code.');
          navigate('/my-bookings');
        },

        prefill: {
          name: currentUser.name,
          email: currentUser.email
        },
        theme: {
          color: '#e50914'
        }
      };

      // Open the Razorpay popup
      const razorpayPopup = new window.Razorpay(razorpayOptions);
      razorpayPopup.open();

    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return <div className="loading">Loading seats...</div>;
  }

  if (errorMessage) {
    return <div className="error">{errorMessage}</div>;
  }

  const allSeatRows = buildAllSeats();

  return (
    <div>

      {/* Showtime info at the top */}
      <div className="showtime-info">
        <h2>{showtime.movieId.title}</h2>
        <p>
          📅 {showtime.date} &nbsp;|&nbsp;
          🕐 {showtime.time} &nbsp;|&nbsp;
          Screen {showtime.screen} &nbsp;|&nbsp;
          LKR {showtime.price} per seat
        </p>
      </div>

      {/* Screen banner */}
      <div className="cinema-screen">
        ── SCREEN ──
      </div>

      {/* Seat map grid */}
      <div className="seat-map">
        {allSeatRows.map((rowSeats, rowIndex) => (
          <div key={rowIndex} className="seat-row">

            {/* Row label — A, B, C etc */}
            <span className="row-label">{rowSeats[0][0]}</span>

            {/* The 10 seats in this row */}
            {rowSeats.map((seatLabel) => (
              <button
                key={seatLabel}
                className={getSeatClass(seatLabel)}
                onClick={() => handleSeatClick(seatLabel)}
                title={seatLabel}
              >
                {seatLabel.slice(1)}
              </button>
            ))}

          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-box available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-box booked"></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Booking summary panel */}
      <div className="booking-summary">
        <h3>Booking Summary</h3>

        {/* Show message if no seats selected yet */}
        {selectedSeats.length === 0 && (
          <p className="no-seats-selected">No seats selected yet. Click on seats above to choose.</p>
        )}

        {/* Show selected seats */}
        {selectedSeats.length > 0 && (
          <>
            <div className="summary-row">
              <span>Selected Seats</span>
              <span>{selectedSeats.sort().join(', ')}</span>
            </div>
            <div className="summary-row">
              <span>Number of Seats</span>
              <span>{selectedSeats.length}</span>
            </div>
            <div className="summary-row">
              <span>Price per Seat</span>
              <span>LKR {showtime.price}</span>
            </div>
          </>
        )}

        {/* Total price */}
        <div className="summary-total">
          <span>Total</span>
          <span>LKR {calculateTotal()}</span>
        </div>

        {/* Proceed to pay button */}
        <button
          className="btn-primary"
          style={{ width: '100%', fontSize: '18px', padding: '16px' }}
          onClick={handleProceedToPay}
          disabled={isProcessing || selectedSeats.length === 0}
        >
          {isProcessing ? 'Processing...' : 'Proceed to Pay'}
        </button>

      </div>
    </div>
  );
}

export default SeatPage;