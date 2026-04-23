const express = require('express');
const router = express.Router();
const {
    getExams,
    getExamById,
    submitExam,
    getMyExamHistory,
    createExam,
    deleteExam,
    updateExam,
} = require('../controllers/examController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getExams)
    .post(protect, admin, createExam);

router.route('/history')
    .get(protect, getMyExamHistory);

router.route('/:id')
    .get(protect, getExamById)
    .put(protect, admin, updateExam)
    .delete(protect, admin, deleteExam);

router.route('/:id/submit')
    .post(protect, submitExam);

module.exports = router;
