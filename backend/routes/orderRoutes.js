const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Create order
router.post('/', protect, createOrder);

// Get user orders
router.get('/user', protect, getUserOrders);

// Admin route for all orders
router.get('/admin', protect, admin, getAllOrders);

// Get order by ID
router.get('/:id', protect, getOrderById);

// Update order status
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router; 