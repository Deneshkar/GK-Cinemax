const Showtime = require('../models/Showtime');

// Returns all showtimes — optionally filtered by movieId
async function getAllShowtimes(req, res) {
  try {

    // If the request has ?movieId=xxx in the URL, filter by that movie
    const filter = req.query.movieId ? { movieId: req.query.movieId } : {};

    // populate('movieId') fills in the full movie details instead of just the id
    const showtimeList = await Showtime.find(filter).populate('movieId');
    res.json(showtimeList);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Returns one showtime by its id — includes booked seats
async function getOneShowtime(req, res) {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('movieId');
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    res.json(showtime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Adds a new showtime — admin only
async function addShowtime(req, res) {
  try {
    const { movieId, screen, date, time, price } = req.body;

    const newShowtime = await Showtime.create({
      movieId,
      screen,
      date,
      time,
      price: price || 600
    });

    res.status(201).json({ message: 'Showtime added successfully', showtime: newShowtime });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getAllShowtimes, getOneShowtime, addShowtime };