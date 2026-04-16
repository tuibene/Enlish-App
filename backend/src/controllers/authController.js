const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            cefrLevel: user.cefrLevel,
            targetScore: user.targetScore,
            studyHoursPerWeek: user.studyHoursPerWeek,
            theme: user.theme,
            language: user.language,
            avatar: user.avatar,
            enrolledCourse: user.enrolledCourse,
            completedCourseDays: user.completedCourseDays,
            purchasedCourses: user.purchasedCourses,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            cefrLevel: user.cefrLevel,
            targetScore: user.targetScore,
            studyHoursPerWeek: user.studyHoursPerWeek,
            theme: user.theme,
            language: user.language,
            avatar: user.avatar,
            enrolledCourse: user.enrolledCourse,
            completedCourseDays: user.completedCourseDays,
            purchasedCourses: user.purchasedCourses,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            cefrLevel: user.cefrLevel,
            targetScore: user.targetScore,
            studyHoursPerWeek: user.studyHoursPerWeek,
            theme: user.theme,
            language: user.language,
            avatar: user.avatar,
            enrolledCourse: user.enrolledCourse,
            completedCourseDays: user.completedCourseDays,
            purchasedCourses: user.purchasedCourses,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.cefrLevel = req.body.cefrLevel || user.cefrLevel;
        user.targetScore = req.body.targetScore || user.targetScore;
        user.studyHoursPerWeek = req.body.studyHoursPerWeek || user.studyHoursPerWeek;
        user.theme = req.body.theme || user.theme;
        user.language = req.body.language || user.language;
        
        if (req.file) {
            user.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            cefrLevel: updatedUser.cefrLevel,
            targetScore: updatedUser.targetScore,
            studyHoursPerWeek: updatedUser.studyHoursPerWeek,
            theme: updatedUser.theme,
            language: updatedUser.language,
            avatar: updatedUser.avatar,
            enrolledCourse: updatedUser.enrolledCourse,
            completedCourseDays: updatedUser.completedCourseDays,
            purchasedCourses: updatedUser.purchasedCourses,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
};
