const mongoose = require('mongoose');

// This defines what a movie looks like in the database
const movieSchema = new mongoose.Schema({

  // The title of the movie
  title: {
    type: String,
    required: true
  },

  // The language the movie is in (Tamil, Sinhala, English etc.)
  language: {
    type: String,
    required: true
  },

  // How long the movie is in minutes
  duration: {
    type: Number,
    required: true
  },

  // A short description of the movie story
  description: {
    type: String,
    required: true
  },

  // The URL of the movie poster image stored in Cloudinary
  posterUrl: {
    type: String,
    required: true
  },

  // Is this movie currently showing at the cinema?
  isShowing: {
    type: Boolean,
    default: true
  },

  comingSoon:{
    type: Boolean,
    default: false
  },

  releaseDate: {
    type: String,
    default: ''
  }

}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);