const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/payment/create-order — create a Razorpay order (must be logged in)
router.post('/create-order', protect, createOrder);

// POST /api/payment/verify — verify the payment after user pays (must be logged in)
router.post('/verify', protect, verifyPayment);

module.exports = router;