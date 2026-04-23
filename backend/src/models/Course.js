const mongoose = require('mongoose');

// ─── Vocabulary Flashcard Schema ───
const vocabCardSchema = mongoose.Schema({
    word: { type: String, required: true },
    phonetic: { type: String, default: '' },
    partOfSpeech: { type: String, default: '' },
    definition: { type: String, required: true },
    example: { type: String, default: '' },
    vietnameseMeaning: { type: String, default: '' },
});

// ─── Reading Task Schema ───
const readingQuestionSchema = mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
});

const readingTaskSchema = mongoose.Schema({
    passage: { type: String, default: '' },
    title: { type: String, default: '' },
    questions: [readingQuestionSchema],
});

// ─── Listening Task Schema ───
const listeningQuestionSchema = mongoose.Schema({
    question: { type: String, default: '' },
    options: [{ type: String }],
    correctAnswer: { type: String, default: '' },
    explanation: { type: String, default: '' },
});

const listeningTaskSchema = mongoose.Schema({
    audioUrl: { type: String, default: '' },
    cloudinaryPublicId: { type: String, default: '' },
    title: { type: String, default: '' },
    transcript: { type: String, default: '' },
    questions: [listeningQuestionSchema],
});

// ─── Speaking Task Schema ───
const speakingTaskSchema = mongoose.Schema({
    prompt: { type: String, default: '' },
    audioUrl: { type: String },
    cloudinaryPublicId: { type: String },
    sampleAnswer: { type: String, default: '' },
    tips: [{ type: String }],
    durationSeconds: { type: Number, default: 60 },
});

// ─── Grammar Task Schema ───
const grammarQuestionSchema = mongoose.Schema({
    instruction: { type: String, default: '' },
    question: { type: String, default: '' },
    options: [{ type: String }],
    correctAnswer: { type: String, default: '' },
    explanation: { type: String, default: '' },
    type: { type: String, enum: ['multiple-choice', 'fill-in', 'error-correction'], default: 'multiple-choice' },
});

const grammarTaskSchema = mongoose.Schema({
    title: { type: String, default: 'Grammar Practice' },
    lesson: { type: String, default: '' },
    questions: [grammarQuestionSchema],
});

// ─── Writing Task Schema (Premium Only) ───
const writingTaskSchema = mongoose.Schema({
    title: { type: String, default: '' },
    prompt: { type: String, required: true },
    taskType: { type: String, enum: ['essay', 'task1', 'task2', 'letter', 'report'], default: 'essay' },
    wordLimit: { type: Number, default: 250 },
    tips: [{ type: String }],
    modelAnswer: { type: String, default: '' },
    criteria: [{ type: String }],
    durationMinutes: { type: Number, default: 40 },
    image: { type: String, default: '' },
    cloudinaryPublicId: { type: String, default: '' },
});

// ─── Daily Tasks Container ───
const dailyTasksSchema = mongoose.Schema({
    vocabulary: [vocabCardSchema],
    grammar: grammarTaskSchema,
    reading: readingTaskSchema,
    listening: listeningTaskSchema,
    speaking: speakingTaskSchema,
    writing: writingTaskSchema,
});

// ─── Course Day Schema ───
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
        default: '',
    },
    phase: {
        type: String,
        enum: ['Foundation', 'Building', 'Advanced', 'Mock Test'],
        default: 'Foundation',
    },
    tasks: dailyTasksSchema,
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
        cloudinaryPublicId: {
            type: String,
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
