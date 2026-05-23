const Movie = require('../models/Movie');
const cloudinary = require('cloudinary').v2;

// Configure cloudinary using keys from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Returns all movies that are currently showing
async function getAllMovies(req, res) {
  try {
    const movieList = await Movie.find({ isShowing: true });
    res.json(movieList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Returns one movie by its id
async function getOneMovie(req, res) {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Adds a new movie — admin only
// The poster image is uploaded to Cloudinary first
async function addMovie(req, res) {
  try {
    const { title, language, duration, description } = req.body;

    // Upload the poster image file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'gk-cinemax-posters'
    });

    // Save the movie with the Cloudinary image URL
    const newMovie = await Movie.create({
      title,
      language,
      duration,
      description,
      posterUrl: uploadResult.secure_url
    });

    res.status(201).json({ message: 'Movie added successfully', movie: newMovie });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getAllMovies, getOneMovie, addMovie };