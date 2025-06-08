const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { tableId, items, totalPrice, specialInstructions } = req.body;
    
    // Validate required fields
    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please provide table ID and order items' });
    }
    
    // Calculate total if not provided
    let calculatedTotal = 0;
    items.forEach(item => {
      calculatedTotal += (item.price * item.quantity);
    });
    
    // Check if provided total matches calculated total
    if (totalPrice && Math.abs(calculatedTotal - totalPrice) > 0.01) {
      return res.status(400).json({ 
        message: 'Total price does not match sum of items',
        calculatedTotal,
        providedTotal: totalPrice
      });
    }
    
    // Create new order
    const order = await Order.create({
      user: req.user._id,
      tableId,
      items,
      totalPrice: totalPrice || calculatedTotal,
      specialInstructions,
      // Default status is 'pending' as defined in the model
      // Calculate points (1 point per dollar spent, rounded down)
      pointsEarned: Math.floor(totalPrice || calculatedTotal)
    });
    
    // Add points to user
    if (order.pointsEarned > 0) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { points: order.pointsEarned } }
      );
    }
    
    // Populate the order with user details before sending response
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { status, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    
    // Add date range if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/user
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');
    
    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to access this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'in-progress', 'ready', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid status' });
    }
    
    const order = await Order.findById(req.params.id);
    
    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update status
    order.status = status;
    
    // If cancelling, handle refunds, etc. if needed
    if (status === 'cancelled') {
      // Refund points if they were earned
      if (order.pointsEarned > 0) {
        await User.findByIdAndUpdate(
          order.user,
          { $inc: { points: -order.pointsEarned } }
        );
      }
    }
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus
}; 