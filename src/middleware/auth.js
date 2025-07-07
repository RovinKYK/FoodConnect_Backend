const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../../config/config.json');
const env = process.env.NODE_ENV || 'development';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // For now, we'll use a placeholder for Choreo token verification
    // In production, this would verify the token with Choreo's API
    let decoded;
    try {
      // Placeholder: In real implementation, verify with Choreo
      decoded = jwt.verify(token, config[env].JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Find user by choreo_user_id
    const user = await User.findOne({
      where: { choreo_user_id: decoded.choreo_user_id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const authorizeUser = (req, res, next) => {
  // Check if user is authorized to perform action on resource
  // This will be used for operations like editing/deleting own food items
  next();
};

module.exports = {
  authenticateToken,
  authorizeUser
}; 