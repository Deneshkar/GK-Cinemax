const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

// Sets up the Gmail email sender using credentials from .env
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Sends a booking confirmation email to the user with their QR code
async function sendConfirmationEmail(userEmail, userName, bookingDetails, qrCode) {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'GK Cinemax — Your Booking Confirmation',
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Hi ${userName},</p>
        <p>Your booking at GK Cinemax is confirmed.</p>
        <p><strong>Movie:</strong> ${bookingDetails.movieTitle}</p>
        <p><strong>Date:</strong> ${bookingDetails.date}</p>
        <p><strong>Time:</strong> ${bookingDetails.time}</p>
        <p><strong>Screen:</strong> ${bookingDetails.screen}</p>
        <p><strong>Seats:</strong> ${bookingDetails.seats.join(', ')}</p>
        <p><strong>Total Paid:</strong> LKR ${bookingDetails.totalPrice}</p>
        <p>Show this QR code at the cinema entrance:</p>
        <img src="${qrCode}" alt="Your QR Code" />
      `
    });
  } catch (error) {
    console.log('Email sending failed:', error.message);
  }
}

// Creates a new booking after payment is verified
async function createBooking(req, res) {
  try {
    const { showtimeId, seats, totalPrice, razorpayPaymentId } = req.body;
    const userId = req.user.id;

    // Get the showtime to check if seats are still available
    const showtime = await Showtime.findById(showtimeId).populate('movieId');
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Check if any of the selected seats are already booked
    const alreadyBooked = seats.filter(seat => showtime.bookedSeats.includes(seat));
    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        message: `These seats are already booked: ${alreadyBooked.join(', ')}`
      });
    }

    // Generate a QR code containing the booking details
    const qrData = JSON.stringify({ userId, showtimeId, seats, totalPrice });
    const qrCode = await QRCode.toDataURL(qrData);

    // Save the booking to the database
    const newBooking = await Booking.create({
      userId,
      showtimeId,
      seats,
      totalPrice,
      paymentStatus: 'paid',
      qrCode,
      razorpayPaymentId
    });

    // Mark the seats as booked in the showtime document
    showtime.bookedSeats.push(...seats);
    await showtime.save();

    // Send confirmation email to the user
    await sendConfirmationEmail(
      req.user.email,
      req.user.name || 'Customer',
      {
        movieTitle: showtime.movieId.title,
        date: showtime.date,
        time: showtime.time,
        screen: showtime.screen,
        seats,
        totalPrice
      },
      qrCode
    );

    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Returns all bookings made by the currently logged in user
async function getMyBookings(req, res) {
  try {
    const myBookings = await Booking.find({ userId: req.user.id })
      .populate({
        path: 'showtimeId',
        populate: { path: 'movieId' }
      })
      .sort({ createdAt: -1 });

    res.json(myBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Returns one booking by its id
async function getOneBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'showtimeId',
        populate: { path: 'movieId' }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Returns all bookings — admin only — for the admin dashboard
async function getAllBookings(req, res) {
  try {
    const allBookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate({
        path: 'showtimeId',
        populate: { path: 'movieId' }
      })
      .sort({ createdAt: -1 });

    res.json(allBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { createBooking, getMyBookings, getOneBooking, getAllBookings };