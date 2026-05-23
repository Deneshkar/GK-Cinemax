const mongoose = require('mongoose');

// This defines what a booking looks like in the database
const bookingSchema = new mongoose.Schema({

  // Which user made this booking — links to the User collection
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Which showtime was booked — links to the Showtime collection
  showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true
  },

  // Which seats were booked — example: ["A1", "A2", "B5"]
  seats: {
    type: [String],
    required: true
  },

  // Total price paid in LKR
  totalPrice: {
    type: Number,
    required: true
  },

  // Was the payment successful or is it still pending?
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },

  // The QR code image stored as a base64 string
  qrCode: {
    type: String,
    default: ''
  },

  // The Razorpay payment id for reference
  razorpayPaymentId: {
    type: String,
    default: ''
  }

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);