const jwt = require('jsonwebtoken');

// This function checks if the user is logged in before allowing access
function protect(req, res, next) {

  // Get the token from the request header
  const token = req.headers.authorization?.split(' ')[1];

  // If there is no token, block access
  if (!token) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  // Check if the token is valid
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

// This function checks if the logged in user is an admin
function adminOnly(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
}

module.exports = { protect, adminOnly };