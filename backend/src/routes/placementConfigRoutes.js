const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getPlacementConfig, updatePlacementConfig } = require('../controllers/placementConfigController');

router.route('/')
    .get(getPlacementConfig)
    .put(protect, admin, updatePlacementConfig);

module.exports = router;
