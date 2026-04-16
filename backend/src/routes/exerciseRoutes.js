const express = require('express');
const router = express.Router();
const {
    getExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise
} = require('../controllers/exerciseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getExercises)
    .post(protect, admin, createExercise);

router.route('/:id')
    .get(protect, getExerciseById)
    .put(protect, admin, updateExercise)
    .delete(protect, admin, deleteExercise);

module.exports = router;
