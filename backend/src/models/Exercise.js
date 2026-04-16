const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: [true, 'Please add a topic (e.g., Tenses, Vocabulary)']
    },
    difficulty: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Any'],
        default: 'Any'
    },
    type: {
        type: String,
        enum: ['multiple_choice', 'fill_in', 'sorting'],
        required: [true, 'Please specify the exercise type']
    },

    // Fields for 'multiple_choice'
    questionPrompt: { type: String }, // e.g., "I ___ to the store yesterday."
    options: [{ type: String }],      // e.g., ["go", "went", "gone", "going"]
    correctAnswer: { type: String },  // e.g., "went"

    // Fields for 'fill_in'
    textWithBlanks: { type: String }, // e.g., "She has ___ (live) here for 5 years."
    blanksAnswers: [{ type: String }],// e.g., ["lived"]

    // Fields for 'sorting'
    jumbledWords: [{ type: String }],   // e.g., ["cat", "on", "sat", "the", "mat", "the"]
    correctSentence: { type: String },  // e.g., "the cat sat on the mat"

    // Universal fields
    explanation: {
        type: String,
        default: 'No explanation provided.'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Exercise', exerciseSchema);
