const mongoose = require('mongoose');

const officialMockExamSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        readingParts: [{
            partNumber: Number,
            title: String,
            text: String, // The reading passage
            questionGroups: [{
                instruction: String,
                type: { type: String, enum: ['gap-fill', 'multiple-choice', 'tfng'] },
                questions: [{
                    text: String, // Question text or gap-fill chunk
                    options: [String] // Used for multiple-choice
                }]
            }]
        }],
        writingTasks: [{
            taskNumber: Number,
            instruction: String,
            imageUrl: String
        }],
        speakingParts: [{
            partNumber: Number,
            instruction: String,
            questions: [String]
        }],
        listeningParts: [{
            partNumber: Number,
            instruction: String,
            type: { type: String, enum: ['gap-fill', 'multiple-choice'] }, // gap-fill or multiple-choice
            questions: [{
                text: String, // For gap-fill with [GAP], or MCQ question
                options: [String] // List of options for MCQ
            }]
        }],
        listeningAudioUrl: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
    }
);

const OfficialMockExam = mongoose.model('OfficialMockExam', officialMockExamSchema);
module.exports = OfficialMockExam;
