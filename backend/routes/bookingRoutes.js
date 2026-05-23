const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getOneBooking, getAllBookings, requestCancellation, handleCancellationRequest } = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST /api/bookings — create a new booking (must be logged in)
router.post('/', protect, createBooking);

// GET /api/bookings/mine — get my bookings (must be logged in)
router.get('/mine', protect, getMyBookings);

// GET /api/bookings/all — get all bookings (admin only)
router.get('/all', protect, adminOnly, getAllBookings);

// GET /api/bookings/:id — get one booking by id (must be logged in)
router.get('/:id', protect, getOneBooking);

// PUT /api/bookings/:id/cancel-request — user requests to cancel booking
router.put('/:id/cancel-request', protect, requestCancellation);

// PUT /api/bookings/:id/handle-cancel — admin approves or rejects cancellation
router.put('/:id/handle-cancel', protect, adminOnly, handleCancellationRequest);

module.exports = router;