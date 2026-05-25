const Movie = require('../models/Movie');
const cloudinary = require('cloudinary').v2;

// Configure cloudinary using keys from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
    const { title, language, duration, description, comingSoon, advanceBookingEnabled, releaseDate } = req.body;

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
      comingSoon: comingSoon === 'true',
      advanceBookingEnabled: comingSoon === 'true' && advanceBookingEnabled === 'true',
      isShowing: comingSoon !== 'true',
      releaseDate,
      posterUrl: uploadResult.secure_url
    });

    res.status(201).json({
      message: 'Movie added successfully',
      movie: newMovie
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Updates an existing movie — admin only
// If a new poster is uploaded it replaces the old one in Cloudinary
async function updateMovie(req, res) {
  try {
    const { title, language, duration, description, isShowing, comingSoon, advanceBookingEnabled, releaseDate } = req.body;

    // Build the update object with the new values
    const updateData = {
      title,
      language,
      duration,
      description,
      isShowing: isShowing === 'true',
      comingSoon: comingSoon === 'true',
      advanceBookingEnabled: comingSoon === 'true' && advanceBookingEnabled === 'true',
      releaseDate
    };

    // If a new poster file was uploaded, upload it to Cloudinary
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: 'gk-cinemax-posters'
        }
      );

      updateData.posterUrl = uploadResult.secure_url;
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({
        message: 'Movie not found'
      });
    }

    res.json({
      message: 'Movie updated successfully',
      movie: updatedMovie
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

// Deletes a movie by id — admin only
async function deleteMovie(req, res) {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

    if (!deletedMovie) {
      return res.status(404).json({
        message: 'Movie not found'
      });
    }

    res.json({
      message: 'Movie deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

async function getAllMovies(req, res) {
  try{
    const movieList = await Movie.find({isShowing:true, comingSoon: { $ne: true }});
    res.json(movieList);
  } catch(error){
    res.status(500).json({message: error.message});
  }
}

async function getAllMoviesForAdmin(req, res) {
  try {
    const movieList = await Movie.find().sort({ createdAt: -1 });
    res.json(movieList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getComingSoonMovies(req, res){
  try{
    const movieList = await Movie.find({comingSoon:true});
    res.json(movieList);
  } catch(error){
    res.status(500).json({message: error.message});
  }
}

module.exports = {
  getAllMovies,
  getAllMoviesForAdmin,
  getComingSoonMovies,
  getOneMovie,
  addMovie,
  updateMovie,
  deleteMovie
};