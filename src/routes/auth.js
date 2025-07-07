const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../../config/config.json');
const env = process.env.NODE_ENV || 'development';

const router = express.Router();

// POST /api/auth/login - Handle Choreo login callback
router.post('/login', async (req, res) => {
  try {
    const { choreo_user_id, email } = req.body;

    if (!choreo_user_id) {
      return res.status(400).json({ error: 'Choreo user ID is required' });
    }

    // Find existing user
    let user = await User.findOne({
      where: { choreo_user_id }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        requiresProfile: true 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { choreo_user_id: user.choreo_user_id },
      config[env].JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/signup - Handle Choreo signup callback
router.post('/signup', async (req, res) => {
  try {
    const { choreo_user_id, email } = req.body;

    if (!choreo_user_id) {
      return res.status(400).json({ error: 'Choreo user ID is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { choreo_user_id }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create user record (profile will be completed later)
    const user = await User.create({
      choreo_user_id,
      first_name: '', // Will be filled in profile completion
      last_name: '', // Will be filled in profile completion
      address: '', // Will be filled in profile completion
      phone_number: '' // Will be filled in profile completion
    });

    // Generate JWT token
    const token = jwt.sign(
      { choreo_user_id: user.choreo_user_id },
      config[env].JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: user.id,
        requiresProfile: true
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// GET /api/auth/user - Get current user details
router.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, config[env].JWT_SECRET || 'your-secret-key');
    
    const user = await User.findOne({
      where: { choreo_user_id: decoded.choreo_user_id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        address: user.address,
        phone_number: user.phone_number,
        requiresProfile: !user.first_name || !user.last_name || !user.address || !user.phone_number
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

module.exports = router; 