const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/user/profile - Create/Update user personal information
router.post('/profile', 
  authenticateToken,
  [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('phone_number')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^\d+$/).withMessage('Phone number must contain only numbers')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { first_name, last_name, address, phone_number } = req.body;

      // Update user profile
      await User.update(
        {
          first_name,
          last_name,
          address,
          phone_number
        },
        {
          where: { id: req.user.id }
        }
      );

      // Get updated user
      const updatedUser = await User.findByPk(req.user.id);

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          address: updatedUser.address,
          phone_number: updatedUser.phone_number
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

// GET /api/user/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        address: user.address,
        phone_number: user.phone_number
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

module.exports = router; 