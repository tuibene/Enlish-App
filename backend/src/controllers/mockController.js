const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');
const { evaluateMockTest } = require('../services/mockGrader');

const evaluateMock = asyncHandler(async (req, res) => {
    const { listeningAnswers, readingAnswers, writingTask1, writingTask2 } = req.body;
    const audioFiles = req.files || []; // Array of files from multer

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Evaluate 4-skills test
    const evaluation = await evaluateMockTest({
        listeningAnswers: listeningAnswers || "[]",
        readingAnswers: readingAnswers || "[]",
        writingTask1: writingTask1 || "",
        writingTask2: writingTask2 || ""
    }, audioFiles);

    // Fetch Recommended Roadmap (Course)
    let recommendedRoadmap = null;
    const courses = await Course.find({ targetType: 'IELTS' }).populate('days.materials');
    
    if (courses.length > 0) {
        const targetLevel = evaluation.targetCourseLevel.toLowerCase();
        recommendedRoadmap = courses.find(c => c.level.toLowerCase().includes(targetLevel));
        if (!recommendedRoadmap) recommendedRoadmap = courses[0];
    }

    res.json({
        success: true,
        evaluation: evaluation,
        roadmap: recommendedRoadmap
    });
});

module.exports = { evaluateMock };
