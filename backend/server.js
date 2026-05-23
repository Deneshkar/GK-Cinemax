require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));

app.use(express.json());


const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const movieRoutes = require('./routes/movieRoutes');
app.use('/api/movies', movieRoutes);

const showtimeRoutes = require('./routes/showtimeRoutes');
app.use('/api/showtimes', showtimeRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
    res.send('GK Cinimax Backend is running!');
});

mongoose.connect(process.env.MONGO_URI,)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

