const express = require('express');
const router = express.Router();
const { chatWithTutor, explainText, gradeEssay, evaluateSpeech } = require('../controllers/aiTutorController');
const { protect } = require('../middleware/authMiddleware');
const { chatLimiter, explainLimiter, gradingLimiter, speakLimiter } = require('../middleware/aiRateLimiter');

// Route: POST /api/ai-tutor
router.post('/', protect, chatLimiter, chatWithTutor);

// Route: POST /api/ai-tutor/explain
router.post('/explain', protect, explainLimiter, explainText);

// Route: POST /api/ai-tutor/grade-essay
router.post('/grade-essay', protect, gradingLimiter, gradeEssay);

// Route: POST /api/ai-tutor/speak
router.post('/speak', protect, speakLimiter, express.json({ limit: '20mb' }), evaluateSpeech);

module.exports = router;
