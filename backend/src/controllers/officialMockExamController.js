const asyncHandler = require('express-async-handler');
const OfficialMockExam = require('../models/OfficialMockExam');

// @desc    Get all active official mock exams
// @route   GET /api/official-mocks
// @access  Public
const getExams = asyncHandler(async (req, res) => {
    const exams = await OfficialMockExam.find({ isActive: true }).select('title description createdAt');
    res.json(exams);
});

// @desc    Get all official mock exams (Admin)
// @route   GET /api/official-mocks/admin
// @access  Private/Admin
const getAdminExams = asyncHandler(async (req, res) => {
    const exams = await OfficialMockExam.find({});
    res.json(exams);
});

// @desc    Get single official mock exam by ID
// @route   GET /api/official-mocks/:id
// @access  Public
const getExamById = asyncHandler(async (req, res) => {
    const exam = await OfficialMockExam.findById(req.params.id);
    if (!exam) {
        res.status(404);
        throw new Error('Official Mock Exam not found');
    }
    res.json(exam);
});

// @desc    Create a new official mock exam
// @route   POST /api/official-mocks
// @access  Private/Admin
const createExam = asyncHandler(async (req, res) => {
    const exam = new OfficialMockExam({
        ...req.body,
        createdBy: req.user._id
    });

    const createdExam = await exam.save();
    res.status(201).json(createdExam);
});

// @desc    Update an official mock exam
// @route   PUT /api/official-mocks/:id
// @access  Private/Admin
const updateExam = asyncHandler(async (req, res) => {
    const exam = await OfficialMockExam.findById(req.params.id);

    if (!exam) {
        res.status(404);
        throw new Error('Official Mock Exam not found');
    }

    Object.assign(exam, req.body);
    const updatedExam = await exam.save();
    res.json(updatedExam);
});

// @desc    Delete an official mock exam
// @route   DELETE /api/official-mocks/:id
// @access  Private/Admin
const deleteExam = asyncHandler(async (req, res) => {
    const exam = await OfficialMockExam.findById(req.params.id);

    if (!exam) {
        res.status(404);
        throw new Error('Official Mock Exam not found');
    }

    await exam.deleteOne();
    res.json({ message: 'Exam removed successfully' });
});

module.exports = {
    getExams,
    getAdminExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam
};
