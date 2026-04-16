const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Material = require('../models/Material');
const { evaluatePlacement } = require('../services/placementGrader');

// @desc    Submit placement test essay and get CEFR level evaluated
// @route   POST /api/users/placement
// @access  Private
const submitPlacementTest = asyncHandler(async (req, res) => {
    const { readingAnswer, listeningAnswer, essayAnswer } = req.body;
    const audioFile = req.file;

    if (!readingAnswer || !listeningAnswer || !essayAnswer || !audioFile) {
        res.status(400);
        throw new Error('Please complete all 4 parts of the placement test, including the speaking recording.');
    }

    if (essayAnswer.split(/\s+/).length < 20) {
        res.status(400);
        throw new Error('Please write at least 20 words for the writing section.');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Evaluate 4-skills test using Gemini AI Multimodal
    const evaluation = await evaluatePlacement(readingAnswer, listeningAnswer, essayAnswer, audioFile);

    // Update user profile
    user.cefrLevel = evaluation.cefrLevel;
    user.hasTakenPlacementTest = true;
    await user.save();

    // Fetch Personalized Recommendations using the CEFR Tag
    const recommendedMaterials = await Material.find({
        tags: { $regex: new RegExp(evaluation.cefrLevel, 'i') }
    }).limit(3);

    res.json({
        success: true,
        cefrLevel: evaluation.cefrLevel,
        feedback: evaluation.feedback,
        recommendedMaterials,
        user: {
            _id: user._id,
            name: user.name,
            cefrLevel: user.cefrLevel,
            hasTakenPlacementTest: user.hasTakenPlacementTest
        }
    });
});

module.exports = { submitPlacementTest };
