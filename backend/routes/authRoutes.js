const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register — create a new account
router.post('/register', register);

// POST /api/auth/login — login and get a token
router.post('/login', login);

// GET /api/auth/profile — get my profile (must be logged in)
router.get('/profile', protect, getProfile);

// PUT /api/auth/profile — update my profile (must be logged in)
router.put('/profile', protect, updateProfile);

module.exports = router;