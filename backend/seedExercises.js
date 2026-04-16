const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exercise = require('./src/models/Exercise');

dotenv.config();

const mockExercises = [
    {
        topic: 'Past Tense vs Present Perfect',
        difficulty: 'B1',
        type: 'multiple_choice',
        questionPrompt: 'I ___ to Paris three times in my life.',
        options: ['go', 'went', 'have been', 'had gone'],
        correctAnswer: 'have been',
        explanation: 'We use the Present Perfect for life experiences without a specific time in the past.'
    },
    {
        topic: 'Business Vocabulary',
        difficulty: 'B2',
        type: 'fill_in',
        textWithBlanks: 'The company plans to ___ (launch/expand) its operations into the European market next year.',
        blanksAnswers: ['expand'],
        explanation: 'To "expand operations" is a common business collocation meaning to grow the business area.'
    },
    {
        topic: 'Sentence Structure',
        difficulty: 'A2',
        type: 'sorting',
        jumbledWords: ['sat', 'cat', 'mat', 'the', 'on'],
        correctSentence: 'the cat sat on the mat',
        explanation: 'Subject (the cat) + Verb (sat) + Prepositional Phrase (on the mat).'
    }
];

const seedExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected.');

        await Exercise.deleteMany();
        console.log('Old exercises deleted.');

        await Exercise.insertMany(mockExercises);
        console.log('Mock exercises populated successfully!');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedExercises();
