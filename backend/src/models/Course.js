const mongoose = require('mongoose');

const courseDaySchema = mongoose.Schema({
    dayNumber: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    exercises: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise',
        }
    ],
    materials: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Material',
        }
    ]
});

const courseSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        targetType: {
            type: String,
            enum: ['IELTS', 'TOEIC', 'GENERAL'],
            required: true,
        },
        durationDays: {
            type: Number,
            required: true,
            default: 30,
        },
        level: {
            type: String,
            required: true,
            default: 'Intermediate',
        },
        image: {
            type: String,
            default: '/images/default-course.jpg',
        },
        days: [courseDaySchema],
        isPremium: {
            type: Boolean,
            default: false,
        },
        price: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
