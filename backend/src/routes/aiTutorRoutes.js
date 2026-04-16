const express = require('express');
const router = express.Router();
const { chatWithTutor, explainText, gradeEssay, evaluateSpeech } = require('../controllers/aiTutorController');
const { protect } = require('../middleware/authMiddleware');

// Route: POST /api/ai-tutor
router.post('/', protect, chatWithTutor);

// Route: POST /api/ai-tutor/explain
router.post('/explain', protect, explainText);

// Route: POST /api/ai-tutor/grade-essay
router.post('/grade-essay', protect, gradeEssay);

// Route: POST /api/ai-tutor/speak
router.post('/speak', protect, express.json({ limit: '20mb' }), evaluateSpeech);

module.exports = router;
