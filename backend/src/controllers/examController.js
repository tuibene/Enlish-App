const asyncHandler = require('express-async-handler');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const { calculateExamScore } = require('../services/examScoring');
const { gradeWriting } = require('../services/aiGrader');

// @desc    Get all active exams
// @route   GET /api/exams
// @access  Private
const getExams = asyncHandler(async (req, res) => {
    const exams = await Exam.find({ isActive: true }).select('-questions.correctAnswerIndex');
    res.json(exams);
});

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExamById = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id).select('-questions.correctAnswerIndex');

    if (exam && exam.isActive) {
        res.json(exam);
    } else {
        res.status(404);
        throw new Error('Exam not found or inactive');
    }
});

// @desc    Submit exam answers
// @route   POST /api/exams/:id/submit
// @access  Private
const submitExam = asyncHandler(async (req, res) => {
    // Array of { questionId, selectedOptionIndex, textAnswer }
    const { answers } = req.body;
    console.log('--- Incoming answers from frontend ---');
    console.log(JSON.stringify(answers, null, 2));

    const exam = await Exam.findById(req.params.id);

    if (!exam || !exam.isActive) {
        res.status(404);
        throw new Error('Exam not found');
    }

    // 1. Separate Multiple Choice vs Writing Questions
    const mcqQuestions = exam.questions.filter(q => q.questionType !== 'WRITING');
    const writingQuestions = exam.questions.filter(q => q.questionType === 'WRITING');

    // 2. Score Multiple Choice (Synchronous logic)
    const { score: mcqScore, totalPossibleScore: mcqTotal, answersData: mcqAnswersData } = calculateExamScore(mcqQuestions, answers);

    let finalScore = mcqScore;
    let finalTotalPossible = mcqTotal;
    const finalAnswersData = [...mcqAnswersData];

    // 3. Score Writing Questions via AI (Asynchronous logic)
    for (const wQuestion of writingQuestions) {
        finalTotalPossible += wQuestion.points; // Add the maximum possible points for writing

        // Find the student's submission for this writing question
        const studentSubmission = answers.find(a => a.questionId.toString() === wQuestion._id.toString());

        let aiFeedback = null;
        let earnedPoints = 0;

        if (studentSubmission && studentSubmission.textAnswer && studentSubmission.textAnswer.trim() !== '') {
            console.log(`Sending essay to AI for Question ${wQuestion._id}. Length: ${studentSubmission.textAnswer.length}`);
            // Call AI
            const feedback = await gradeWriting(wQuestion.text, studentSubmission.textAnswer);

            // Map the 0-10 AI score scale to the actual question points
            // For example, if max points is 10 and AI gave 8 -> 8 points.
            earnedPoints = (feedback.score / 10) * wQuestion.points;

            aiFeedback = {
                score: feedback.score,
                explanation: feedback.explanation,
                suggestions: feedback.suggestions
            };
        } else {
            console.warn(`Empty text answer received for Writing Question ${wQuestion._id}`);
            aiFeedback = {
                score: 0,
                explanation: "You did not write anything for this essay. The AI requires a text submission to grade your writing and grammar.",
                suggestions: ["Please attempt the question next time to receive actionable feedback."]
            };
        }

        finalScore += earnedPoints;
        finalAnswersData.push({
            questionId: wQuestion._id,
            selectedOptionIndex: null,
            isCorrect: earnedPoints > 0, // Mark as correct if any point was given
            textAnswer: studentSubmission ? studentSubmission.textAnswer : '',
            aiFeedback
        });
    }

    // 4. Create the comprehensive ExamResult
    const examResult = await ExamResult.create({
        user: req.user._id,
        exam: exam._id,
        score: finalScore,
        totalPossibleScore: finalTotalPossible,
        answers: finalAnswersData,
    });

    res.status(201).json(examResult);
});

// @desc    Get logged in user exam history
// @route   GET /api/exams/history
// @access  Private
const getMyExamHistory = asyncHandler(async (req, res) => {
    const results = await ExamResult.find({ user: req.user._id })
        .populate('exam', 'title type')
        .sort({ createdAt: -1 });

    res.json(results);
});

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private/Admin
const createExam = asyncHandler(async (req, res) => {
    const { title, type, description, questions } = req.body;

    const exam = new Exam({
        title,
        type,
        description,
        questions,
        createdBy: req.user._id,
    });

    const createdExam = await exam.save();
    res.status(201).json(createdExam);
});

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
const deleteExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);

    if (exam) {
        await exam.deleteOne();
        res.json({ message: 'Exam removed' });
    } else {
        res.status(404);
        throw new Error('Exam not found');
    }
});

module.exports = {
    getExams,
    getExamById,
    submitExam,
    getMyExamHistory,
    createExam,
    deleteExam,
};
