const mongoose = require('mongoose');

const placementConfigSchema = new mongoose.Schema({
    readingContext: {
        type: String,
        required: true,
        default: "The advent of artificial intelligence (AI) has significantly transformed the global economic landscape. While some economists argue that AI will inevitably displace human labor across various sectors leading to widespread unemployment, others contend that it will create new, highly skilled job categories and increase overall productivity. Historical precedents, such as the Industrial Revolution, suggest a transitional period of disruption followed by long-term economic growth. However, the unprecedented speed of AI development necessitates proactive policies in education and workforce retraining to mitigate socioeconomic disparities."
    },
    readingQuestion: {
        type: String,
        required: true,
        default: "Based on the text, contrast the divergent views of economists regarding the impact of AI on the workforce, and identify the proposed solution to address potential disruptions. Summarize in your own words."
    },
    listeningAudioUrl: {
        type: String,
        required: true,
        default: "/placement-audio.mp3"
    },
    listeningQuestion: {
        type: String,
        required: true,
        default: "Listen to the recording. What is the central theme of the speaker's presentation, and what key evidence do they provide to support their argument? (Provide a concise summary)"
    },
    writingPrompt: {
        type: String,
        required: true,
        default: "Some people believe that technological advancements have made humans less socially active, while others argue that technology has connected us more than ever before. Discuss both views and give your own opinion. (Write at least 50 words)"
    },
    speakingPrompt: {
        type: String,
        required: true,
        default: "Press record and speak clearly into your microphone for 30-45 seconds. Compare and contrast two different methods of learning a new language. Which method do you believe is more effective, and why?"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PlacementConfig', placementConfigSchema);
