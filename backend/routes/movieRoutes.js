const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllMovies, getAllMoviesForAdmin, getOneMovie, addMovie, updateMovie, deleteMovie, getComingSoonMovies } = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// GET /api/movies — get all currently showing movies
router.get('/', getAllMovies);

// GET /api/movies/coming-soon — get all coming soon movies
router.get('/coming-soon', getComingSoonMovies);

// GET /api/movies/admin/all — get all movies for admin scheduling
router.get('/admin/all', protect, adminOnly, getAllMoviesForAdmin);

// GET /api/movies/:id — get one movie by id
router.get('/:id', getOneMovie);

// POST /api/movies — add a new movie (admin only)
router.post('/', protect, adminOnly, upload.single('poster'), addMovie);

// PUT /api/movies/:id — update a movie (admin only)
router.put('/:id', protect, adminOnly, upload.single('poster'), updateMovie);

// DELETE /api/movies/:id — delete a movie (admin only)
router.delete('/:id', protect, adminOnly, deleteMovie);


module.exports = router;