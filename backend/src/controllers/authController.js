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
            coverImage: user.coverImage,
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
            coverImage: user.coverImage,
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
            coverImage: user.coverImage,
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
        
        if (req.files && req.files.length > 0) {
            const cloudinary = require('cloudinary').v2;
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });

            for (const file of req.files) {
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'image',
                            folder: 'english-learning/avatars',
                            public_id: `${req.user._id}-${file.fieldname}-${Date.now()}`,
                            transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(file.buffer);
                });

                if (file.fieldname === 'avatar') {
                    user.avatar = uploadResult.secure_url;
                } else if (file.fieldname === 'coverImage') {
                    user.coverImage = uploadResult.secure_url;
                }
            }
        }
        
        // Fallback for older single file upload
        if (req.file) {
            const cloudinary = require('cloudinary').v2;
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'english-learning/avatars',
                        public_id: `${req.user._id}-${req.file.fieldname}-${Date.now()}`,
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            if (req.file.fieldname === 'coverImage') {
                user.coverImage = uploadResult.secure_url;
            } else {
                user.avatar = uploadResult.secure_url;
            }
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
            coverImage: updatedUser.coverImage,
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

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.role = req.body.role || user.role;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Root
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'ROOT') {
            res.status(400);
            throw new Error('Cannot delete ROOT user');
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    updateUserRole,
    deleteUser,
};
