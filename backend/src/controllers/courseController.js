const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Fetch all courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
    // Return courses without the heavy `days` array to keep the overview light
    const courses = await Course.find({}).select('-days.content -days.exercises -days.materials');
    res.json(courses);
});

// @desc    Fetch single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        res.json(course);
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (course && user) {
        if (course.isPremium) {
            if (!user.purchasedCourses || !user.purchasedCourses.includes(course._id)) {
                res.status(403);
                throw new Error('You must purchase this premium course before enrolling.');
            }
        }

        // Enrolling wipes previous progress and sets the active course
        user.enrolledCourse = course._id;
        user.completedCourseDays = [];
        await user.save();

        res.json({
            message: 'Successfully enrolled in course',
            enrolledCourse: user.enrolledCourse,
            completedCourseDays: user.completedCourseDays
        });
    } else {
        res.status(404);
        if (!course) throw new Error('Course not found');
        if (!user) throw new Error('User not found');
    }
});

// @desc    Mark a course day as completed
// @route   POST /api/courses/:id/complete
// @access  Private
const completeCourseDay = asyncHandler(async (req, res) => {
    const { dayNumber } = req.body;
    const courseId = req.params.id;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Verify user is enrolled in THIS course
    if (!user.enrolledCourse || user.enrolledCourse.toString() !== courseId) {
        res.status(400);
        throw new Error('You are not currently enrolled in this course.');
    }

    const dayNumInt = parseInt(dayNumber, 10);

    // Add day to array if not already present
    if (!user.completedCourseDays.includes(dayNumInt)) {
        user.completedCourseDays.push(dayNumInt);
        await user.save();
    }

    res.json({
        message: `Day ${dayNumber} completed!`,
        completedCourseDays: user.completedCourseDays
    });
});

// @desc    Purchase a premium course (Mock)
// @route   POST /api/courses/:id/purchase
// @access  Private
const purchaseCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (course && user) {
        if (!course.isPremium) {
            res.status(400);
            throw new Error('This course is free and does not require purchase.');
        }

        // Check if already purchased
        if (user.purchasedCourses && user.purchasedCourses.includes(course._id)) {
            res.status(400);
            throw new Error('You already own this course.');
        }

        if (!user.purchasedCourses) {
            user.purchasedCourses = [];
        }

        user.purchasedCourses.push(course._id);
        await user.save();

        res.json({
            message: 'Course purchased successfully!',
            purchasedCourses: user.purchasedCourses,
        });
    } else {
        res.status(404);
        throw new Error('Course or User not found');
    }
});

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
    const course = new Course({
        title: 'New Premium Course',
        description: 'Course description here...',
        targetType: 'IELTS',
        durationDays: 30,
        level: 'Intermediate',
        image: '/images/default-course.jpg',
        isPremium: true,
        price: 500000,
        days: [],
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
    const { title, description, targetType, durationDays, level, image, isPremium, price, days } = req.body;

    const course = await Course.findById(req.params.id);

    if (course) {
        course.title = title !== undefined ? title : course.title;
        course.description = description !== undefined ? description : course.description;
        course.targetType = targetType !== undefined ? targetType : course.targetType;
        course.durationDays = durationDays !== undefined ? durationDays : course.durationDays;
        course.level = level !== undefined ? level : course.level;
        course.image = image !== undefined ? image : course.image;
        course.isPremium = isPremium !== undefined ? isPremium : course.isPremium;
        course.price = price !== undefined ? price : course.price;
        course.days = days !== undefined ? days : course.days;

        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        await Course.deleteOne({ _id: course._id });
        res.json({ message: 'Course removed' });
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
});

module.exports = {
    getCourses,
    getCourseById,
    enrollCourse,
    completeCourseDay,
    createCourse,
    updateCourse,
    deleteCourse,
    purchaseCourse
};
