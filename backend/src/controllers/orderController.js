const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'name email')
        .populate('course', 'title price')
        .sort({ createdAt: -1 }); // newest first

    res.json(orders);
});

module.exports = {
    getAllOrders
};
