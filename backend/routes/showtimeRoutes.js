const express = require('express');
const router = express.Router();
const { getAllShowtimes, getOneShowtime, addShowtime, updateShowtime, deleteShowtime } = require('../controllers/showtimeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/showtimes — get all showtimes (anyone can see this)
// Can filter by movie: /api/showtimes?movieId=xxx
router.get('/', getAllShowtimes);

// GET /api/showtimes/:id — get one showtime with booked seats
router.get('/:id', getOneShowtime);

// POST /api/showtimes — add a new showtime (admin only)
router.post('/', protect, adminOnly, addShowtime);

// PUT /api/showtimes/:id — update an existing showtime (admin only)
router.put('/:id', protect, adminOnly, updateShowtime);

// DELETE /api/showtimes/:id — delete a showtime (admin only)
router.delete('/:id', protect, adminOnly, deleteShowtime);

module.exports = router;