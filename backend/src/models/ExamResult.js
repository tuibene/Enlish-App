const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        totalPossibleScore: {
            type: Number,
            required: true,
        },
        answers: [
            {
                questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
                selectedOptionIndex: { type: Number },
                isCorrect: { type: Boolean },
                textAnswer: { type: String }, // For WRITING questions
                aiFeedback: {
                    score: { type: Number },
                    explanation: { type: String },
                    suggestions: [{ type: String }]
                }
            }
        ],
    },
    {
        timestamps: true,
    }
);

examResultSchema.index({ user: 1, createdAt: -1 });
examResultSchema.index({ exam: 1 });

const ExamResult = mongoose.model('ExamResult', examResultSchema);
module.exports = ExamResult;
