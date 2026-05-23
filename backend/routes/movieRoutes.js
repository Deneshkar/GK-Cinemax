const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllMovies, getOneMovie, addMovie } = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Multer saves uploaded files temporarily to a folder called "uploads"
const upload = multer({ dest: 'uploads/' });

// GET /api/movies — get all currently showing movies (anyone can see this)
router.get('/', getAllMovies);

// GET /api/movies/:id — get one movie by id (anyone can see this)
router.get('/:id', getOneMovie);

// POST /api/movies — add a new movie (admin only, with poster image)
router.post('/', protect, adminOnly, upload.single('poster'), addMovie);

module.exports = router;