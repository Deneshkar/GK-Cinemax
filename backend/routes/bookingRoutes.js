const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getOneBooking, getAllBookings } = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST /api/bookings — create a new booking (must be logged in)
router.post('/', protect, createBooking);

// GET /api/bookings/mine — get my bookings (must be logged in)
router.get('/mine', protect, getMyBookings);

// GET /api/bookings/all — get all bookings (admin only)
router.get('/all', protect, adminOnly, getAllBookings);

// GET /api/bookings/:id — get one booking by id (must be logged in)
router.get('/:id', protect, getOneBooking);

module.exports = router;