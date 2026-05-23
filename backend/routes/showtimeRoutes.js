const express = require('express');
const router = express.Router();
const { getAllShowtimes, getOneShowtime, addShowtime } = require('../controllers/showtimeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/showtimes — get all showtimes (anyone can see this)
// Can filter by movie: /api/showtimes?movieId=xxx
router.get('/', getAllShowtimes);

// GET /api/showtimes/:id — get one showtime with booked seats
router.get('/:id', getOneShowtime);

// POST /api/showtimes — add a new showtime (admin only)
router.post('/', protect, adminOnly, addShowtime);

module.exports = router;