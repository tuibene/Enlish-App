const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        password: {
            type: String,
            required: function () {
                // Password is not required if logging in with Google
                return !this.googleId;
            },
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        role: {
            type: String,
            enum: ['USER', 'ADMIN', 'ROOT'],
            default: 'USER',
        },
        avatar: {
            type: String,
            default: '',
        },
        coverImage: {
            type: String,
            default: '',
        },
        cefrLevel: {
            type: String,
            enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
            default: 'A1',
        },
        hasTakenPlacementTest: {
            type: Boolean,
            default: false,
        },
        enrolledCourse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            default: null
        },
        completedCourseDays: [
            {
                type: Number
            }
        ],
        purchasedCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        targetScore: {
            type: Number,
            default: 6.5,
        },
        studyHoursPerWeek: {
            type: Number,
            default: 10,
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light',
        },
        language: {
            type: String,
            enum: ['en', 'vi'],
            default: 'en',
        },
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
