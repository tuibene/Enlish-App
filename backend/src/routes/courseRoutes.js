const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourseById,
    enrollCourse,
    completeCourseDay,
    createCourse,
    updateCourse,
    deleteCourse,
    purchaseCourse
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCourses)
    .post(protect, admin, createCourse);

router.route('/:id')
    .get(getCourseById)
    .put(protect, admin, updateCourse)
    .delete(protect, admin, deleteCourse);

router.route('/:id/enroll').post(protect, enrollCourse);
router.route('/:id/complete').post(protect, completeCourseDay);
router.route('/:id/purchase').post(protect, purchaseCourse);

module.exports = router;
