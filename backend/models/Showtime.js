const mongoose = require('mongoose');

// This defines what a showtime looks like in the database
const showtimeSchema = new mongoose.Schema({

  // Which movie is being shown — links to the Movie collection
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },

  // Which screen is this showing on — either 1 or 2
  screen: {
    type: Number,
    enum: [1, 2],
    required: true
  },

  // The date of the showing — example: "2024-06-15"
  date: {
    type: String,
    required: true
  },

  // The time of the showing — example: "18:30"
  time: {
    type: String,
    required: true
  },

  // The ticket price in LKR
  price: {
    type: Number,
    default: 600
  },

  // List of seat numbers that have already been booked
  // Example: ["A1", "A2", "B5"]
  bookedSeats: {
    type: [String],
    default: []
  }

}, { timestamps: true });

module.exports = mongoose.model('Showtime', showtimeSchema);