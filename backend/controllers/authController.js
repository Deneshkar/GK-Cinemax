const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const OTP_EXPIRY_MS = 10 * 60 * 1000;

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

    // Strict Email Validation (RFC 5322 Standard)
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid and real email address format' });
    }

    // Strict Password Validation
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' });
    }

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

// Updates the profile of the currently logged in user
async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    
    // Only update email if it's changing and validate it
    if (req.body.email && req.body.email !== user.email) {
      if (!EMAIL_REGEX.test(req.body.email)) {
        return res.status(400).json({ message: 'Please provide a valid email address format' });
      }
      // Check if new email is already taken
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = req.body.email;
    }

    // Only update password if provided and validate it
    if (req.body.password) {
      if (!PASSWORD_REGEX.test(req.body.password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' });
      }
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      token: createToken(updatedUser),
      user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, isAdmin: updatedUser.isAdmin }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Sends a one-time password to the user's email for password reset
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetPasswordOtp = await bcrypt.hash(otp, 10);
    user.resetPasswordExpires = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: 'GK Cinemax — Password Reset Code',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>Use the code below to reset your GK Cinemax password. This code expires in 10 minutes.</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">${otp}</p>
          <p>If you did not request this, you can ignore this email.</p>
        `
      });
    } catch (emailError) {
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) {
        console.log(`[Password Reset] OTP for ${user.email}: ${otp}`);
      } else {
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res.status(500).json({
          message: 'Failed to send OTP email. Check EMAIL_USER and EMAIL_PASS in your server .env file.'
        });
      }
    }

    res.json({ message: 'A 6-digit OTP has been sent to your email. It expires in 10 minutes.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Verifies OTP and sets a new password
async function resetPassword(req, res) {
  try {
    const { email, otp, password } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
      return res.status(400).json({ message: 'Please enter the 6-digit OTP from your email' });
    }

    if (!password || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
      });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user || !user.resetPasswordOtp || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }

    if (user.resetPasswordExpires < new Date()) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const otpMatch = await bcrypt.compare(String(otp).trim(), user.resetPasswordOtp);
    if (!otpMatch) {
      return res.status(400).json({ message: 'Invalid OTP. Please check the code and try again.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now sign in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { register, login, getProfile, updateProfile, forgotPassword, resetPassword };