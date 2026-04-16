const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { evaluateMock } = require('../controllers/mockController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/evaluate').post(protect, upload.array('audioFiles', 3), evaluateMock);

module.exports = router;
