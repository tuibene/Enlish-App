const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { submitPlacementTest } = require('../controllers/placementController');

const multer = require('multer');

// Store the audio buffer in memory before sending to Gemini
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/').post(protect, upload.single('audioBlob'), submitPlacementTest);

module.exports = router;
