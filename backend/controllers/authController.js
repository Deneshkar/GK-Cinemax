const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Creates a JWT token for a user using their id, email and isAdmin status
function createToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Registers a new user account
async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user to the database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone
    });

    // Return a token so the user is logged in immediately after registering
    res.status(201).json({
      message: 'Account created successfully',
      token: createToken(newUser),
      user: { id: newUser._id, name: newUser.name, email: newUser.email, isAdmin: newUser.isAdmin }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Logs in an existing user and returns a token
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Return a token
    res.json({
      message: 'Login successful',
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Returns the profile of the currently logged in user
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { register, login, getProfile };