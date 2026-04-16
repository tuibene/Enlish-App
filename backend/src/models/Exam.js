const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionType: { type: String, enum: ['MULTIPLE_CHOICE', 'WRITING'], default: 'MULTIPLE_CHOICE' },
    text: { type: String, required: true },
    options: [{ type: String }],
    correctAnswerIndex: { type: Number, min: 0, max: 3 }, // 0 to 3 for 4 options
    points: { type: Number, default: 1 }
});

const examSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['IELTS', 'TOEIC', 'General'],
            required: true,
        },
        description: {
            type: String,
        },
        questions: [questionSchema],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

examSchema.index({ type: 1 });
examSchema.index({ isActive: 1 });

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;
