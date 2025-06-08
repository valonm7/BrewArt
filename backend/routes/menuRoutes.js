const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuCategories
} = require('../controllers/menuController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getMenuItems);
router.get('/categories', getMenuCategories);
router.get('/:id', getMenuItemById);

// Admin routes
router.post('/', protect, admin, createMenuItem);
router.put('/:id', protect, admin, updateMenuItem);
router.delete('/:id', protect, admin, deleteMenuItem);

module.exports = router; 