const asyncHandler = require('express-async-handler');
const Exercise = require('../models/Exercise');

// @desc    Get all exercises (supports filtering by type or difficulty)
// @route   GET /api/exercises
// @access  Private
const getExercises = asyncHandler(async (req, res) => {
    const { type, difficulty, topic } = req.query;

    let query = {};
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topic = { $regex: topic, $options: 'i' };

    const exercises = await Exercise.find(query).sort({ createdAt: -1 });
    res.json(exercises);
});

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Private
const getExerciseById = asyncHandler(async (req, res) => {
    const exercise = await Exercise.findById(req.params.id);

    if (exercise) {
        res.json(exercise);
    } else {
        res.status(404);
        throw new Error('Exercise not found');
    }
});

// @desc    Create an exercise
// @route   POST /api/exercises
// @access  Private/Admin
const createExercise = asyncHandler(async (req, res) => {
    const {
        topic,
        difficulty,
        type,
        questionPrompt,
        options,
        correctAnswer,
        textWithBlanks,
        blanksAnswers,
        jumbledWords,
        correctSentence,
        explanation
    } = req.body;

    const exercise = new Exercise({
        topic,
        difficulty,
        type,
        questionPrompt,
        options,
        correctAnswer,
        textWithBlanks,
        blanksAnswers,
        jumbledWords,
        correctSentence,
        explanation
    });

    const createdExercise = await exercise.save();
    res.status(201).json(createdExercise);
});

// @desc    Update an exercise
// @route   PUT /api/exercises/:id
// @access  Private/Admin
const updateExercise = asyncHandler(async (req, res) => {
    const exercise = await Exercise.findById(req.params.id);

    if (exercise) {
        exercise.topic = req.body.topic || exercise.topic;
        exercise.difficulty = req.body.difficulty || exercise.difficulty;
        exercise.type = req.body.type || exercise.type;
        exercise.questionPrompt = req.body.questionPrompt || exercise.questionPrompt;
        exercise.options = req.body.options || exercise.options;
        exercise.correctAnswer = req.body.correctAnswer || exercise.correctAnswer;
        exercise.textWithBlanks = req.body.textWithBlanks || exercise.textWithBlanks;
        exercise.blanksAnswers = req.body.blanksAnswers || exercise.blanksAnswers;
        exercise.jumbledWords = req.body.jumbledWords || exercise.jumbledWords;
        exercise.correctSentence = req.body.correctSentence || exercise.correctSentence;
        exercise.explanation = req.body.explanation || exercise.explanation;

        const updatedExercise = await exercise.save();
        res.json(updatedExercise);
    } else {
        res.status(404);
        throw new Error('Exercise not found');
    }
});

// @desc    Delete an exercise
// @route   DELETE /api/exercises/:id
// @access  Private/Admin
const deleteExercise = asyncHandler(async (req, res) => {
    const exercise = await Exercise.findById(req.params.id);

    if (exercise) {
        await exercise.deleteOne();
        res.json({ message: 'Exercise removed' });
    } else {
        res.status(404);
        throw new Error('Exercise not found');
    }
});

module.exports = {
    getExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise
};
