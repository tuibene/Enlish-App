const asyncHandler = require('express-async-handler');
const PlacementConfig = require('../models/PlacementConfig');

// @desc    Get the current Placement Test Configuration
// @route   GET /api/placement-config
// @access  Public (or Protected)
const getPlacementConfig = asyncHandler(async (req, res) => {
    let config = await PlacementConfig.findOne();

    if (!config) {
        // Create default if none exists
        config = await PlacementConfig.create({});
    }

    res.json(config);
});

// @desc    Update the Placement Test Configuration
// @route   PUT /api/placement-config
// @access  Private/Admin
const updatePlacementConfig = asyncHandler(async (req, res) => {
    let config = await PlacementConfig.findOne();

    if (config) {
        config.readingContext = req.body.readingContext || config.readingContext;
        config.readingQuestion = req.body.readingQuestion || config.readingQuestion;
        config.listeningAudioUrl = req.body.listeningAudioUrl || config.listeningAudioUrl;
        config.listeningQuestion = req.body.listeningQuestion || config.listeningQuestion;
        config.writingPrompt = req.body.writingPrompt || config.writingPrompt;
        config.speakingPrompt = req.body.speakingPrompt || config.speakingPrompt;

        const updatedConfig = await config.save();
        res.json(updatedConfig);
    } else {
        // Upsert fallback
        config = await PlacementConfig.create(req.body);
        res.status(201).json(config);
    }
});

module.exports = {
    getPlacementConfig,
    updatePlacementConfig
};
