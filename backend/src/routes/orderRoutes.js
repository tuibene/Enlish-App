const express = require('express');
const router = express.Router();
const { getAllOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getAllOrders);

module.exports = router;
