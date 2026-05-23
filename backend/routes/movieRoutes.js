const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllMovies, getOneMovie, addMovie, updateMovie, deleteMovie } = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// GET /api/movies — get all currently showing movies
router.get('/', getAllMovies);

// GET /api/movies/:id — get one movie by id
router.get('/:id', getOneMovie);

// POST /api/movies — add a new movie (admin only)
router.post('/', protect, adminOnly, upload.single('poster'), addMovie);

// PUT /api/movies/:id — update a movie (admin only)
router.put('/:id', protect, adminOnly, upload.single('poster'), updateMovie);

// DELETE /api/movies/:id — delete a movie (admin only)
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;