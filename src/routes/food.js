const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { FoodItem, User, FoodRequest, Notification } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// POST /api/food - Add a new food item
router.post('/', 
  authenticateToken,
  [
    body('food_type').notEmpty().withMessage('Food type is required'),
    body('quantity_available').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('quantity_unit').isIn(['count', 'grams']).withMessage('Quantity unit must be count or grams'),
    body('prepared_date').isISO8601().withMessage('Valid prepared date is required'),
    body('prepared_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid prepared time is required'),
    body('description').optional().isString(),
    body('image_url').optional().isURL().withMessage('Valid image URL is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        food_type,
        quantity_available,
        quantity_unit,
        prepared_date,
        prepared_time,
        description,
        image_url
      } = req.body;

      const foodItem = await FoodItem.create({
        donor_id: req.user.id,
        food_type,
        quantity_available,
        quantity_unit,
        prepared_date,
        prepared_time,
        description,
        image_url
      });

      res.status(201).json({
        message: 'Food item created successfully',
        food_item: foodItem
      });
    } catch (error) {
      console.error('Create food item error:', error);
      res.status(500).json({ error: 'Failed to create food item' });
    }
  }
);

// GET /api/food - Get all available food items with search and filters
router.get('/', 
  [
    query('search').optional().isString(),
    query('town').optional().isString()
  ],
  async (req, res) => {
    try {
      const { search, town } = req.query;
      const whereClause = {};

      // Build search conditions
      if (search) {
        whereClause.food_type = {
          [Op.iLike]: `%${search}%`
        };
      }

      const includeClause = [
        {
          model: User,
          as: 'donor',
          attributes: ['id', 'first_name', 'last_name', 'address'],
          where: town ? {
            address: {
              [Op.iLike]: `%${town}%`
            }
          } : undefined
        }
      ];

      const foodItems = await FoodItem.findAll({
        where: whereClause,
        include: includeClause,
        order: [['created_at', 'DESC']]
      });

      res.json({ food_items: foodItems });
    } catch (error) {
      console.error('Get food items error:', error);
      res.status(500).json({ error: 'Failed to get food items' });
    }
  }
);

// GET /api/food/:id - Get details of a specific food item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const foodItem = await FoodItem.findByPk(id, {
      include: [
        {
          model: User,
          as: 'donor',
          attributes: ['id', 'first_name', 'last_name', 'address', 'phone_number']
        }
      ]
    });

    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    res.json({ food_item: foodItem });
  } catch (error) {
    console.error('Get food item error:', error);
    res.status(500).json({ error: 'Failed to get food item' });
  }
});

// GET /api/food/myfoods - Get food items donated by the authenticated user
router.get('/myfoods', authenticateToken, async (req, res) => {
  try {
    const foodItems = await FoodItem.findAll({
      where: { donor_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json({ food_items: foodItems });
  } catch (error) {
    console.error('Get my foods error:', error);
    res.status(500).json({ error: 'Failed to get my foods' });
  }
});

// PUT /api/food/:id - Update an existing food item (only by donor)
router.put('/:id',
  authenticateToken,
  [
    body('food_type').notEmpty().withMessage('Food type is required'),
    body('quantity_available').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('quantity_unit').isIn(['count', 'grams']).withMessage('Quantity unit must be count or grams'),
    body('prepared_date').isISO8601().withMessage('Valid prepared date is required'),
    body('prepared_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid prepared time is required'),
    body('description').optional().isString(),
    body('image_url').optional().isURL().withMessage('Valid image URL is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const {
        food_type,
        quantity_available,
        quantity_unit,
        prepared_date,
        prepared_time,
        description,
        image_url
      } = req.body;

      const foodItem = await FoodItem.findByPk(id);

      if (!foodItem) {
        return res.status(404).json({ error: 'Food item not found' });
      }

      if (foodItem.donor_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this food item' });
      }

      await foodItem.update({
        food_type,
        quantity_available,
        quantity_unit,
        prepared_date,
        prepared_time,
        description,
        image_url
      });

      res.json({
        message: 'Food item updated successfully',
        food_item: foodItem
      });
    } catch (error) {
      console.error('Update food item error:', error);
      res.status(500).json({ error: 'Failed to update food item' });
    }
  }
);

// DELETE /api/food/:id - Delete a food item (only by donor)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const foodItem = await FoodItem.findByPk(id);

    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    if (foodItem.donor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this food item' });
    }

    await foodItem.destroy();

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({ error: 'Failed to delete food item' });
  }
});

// POST /api/food/:id/request - Create a request for a food item
router.post('/:id/request',
  authenticateToken,
  [
    body('requested_amount').isFloat({ min: 0.01 }).withMessage('Requested amount must be greater than 0')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { requested_amount } = req.body;

      const foodItem = await FoodItem.findByPk(id, {
        include: [
          {
            model: User,
            as: 'donor',
            attributes: ['id', 'first_name', 'last_name']
          }
        ]
      });

      if (!foodItem) {
        return res.status(404).json({ error: 'Food item not found' });
      }

      if (foodItem.donor_id === req.user.id) {
        return res.status(400).json({ error: 'Cannot request your own food item' });
      }

      if (requested_amount > foodItem.quantity_available) {
        return res.status(400).json({ error: 'Requested amount exceeds available quantity' });
      }

      // Create food request
      const foodRequest = await FoodRequest.create({
        food_item_id: id,
        requester_id: req.user.id,
        requested_amount
      });

      // Update food item quantity
      await foodItem.update({
        quantity_available: foodItem.quantity_available - requested_amount
      });

      // Create notification for donor
      const message = `${req.user.first_name} ${req.user.last_name} is coming to collect ${requested_amount} ${foodItem.quantity_unit} of ${foodItem.food_type}`;
      
      await Notification.create({
        recipient_user_id: foodItem.donor_id,
        sender_user_id: req.user.id,
        food_item_id: id,
        requested_amount,
        message
      });

      res.json({
        message: 'Food request created successfully',
        food_request: foodRequest,
        updated_quantity: foodItem.quantity_available
      });
    } catch (error) {
      console.error('Create food request error:', error);
      res.status(500).json({ error: 'Failed to create food request' });
    }
  }
);

module.exports = router; 