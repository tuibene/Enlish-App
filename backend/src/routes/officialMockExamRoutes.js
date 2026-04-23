const express = require('express');
const router = express.Router();
const {
    getExams,
    getAdminExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam
} = require('../controllers/officialMockExamController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getExams)
    .post(protect, admin, createExam);

router.route('/admin')
    .get(protect, admin, getAdminExams);

router.route('/:id')
    .get(getExamById)
    .put(protect, admin, updateExam)
    .delete(protect, admin, deleteExam);

module.exports = router;
