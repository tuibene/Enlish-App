const { GoogleGenAI } = require('@google/genai');
const PlacementConfig = require('../models/PlacementConfig');

const evaluatePlacement = async (readingAnswer, listeningAnswer, studentEssay, audioFile) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY is not set. Using fallback logic.');
            return {
                cefrLevel: 'B1',
                feedback: 'AI Evaluation is currently disabled because the API key is missing. Assigning default B1 level.',
            };
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Fetch dynamic context from DB
        let config = await PlacementConfig.findOne();
        if (!config) {
            // Safe fallback if not created yet
            config = {
                readingContext: "Despite the heavy rain, the team decided to proceed with the outdoor event.",
                readingQuestion: "Why did many attendees leave? Summarize in your own words.",
                listeningQuestion: "What is the main topic discussed in the audio track? (Provide a 1-2 sentence summary)",
                writingPrompt: "Introduce yourself and describe a recent challenge you faced and how you overcame it.",
                speakingPrompt: "Tell us about your favorite travel destination and why you like it."
            };
        }

        const systemPrompt = `
You are an expert Cambridge English language examiner evaluating a student's placement test to determine their Common European Framework of Reference for Languages (CEFR) level. The test consists of four parts examining all language skills.

**Part 1: Reading & Grammar Context** (Evaluating context understanding)
Admin Context Provided to Student: "${config.readingContext}"
Admin Question: "${config.readingQuestion}"
Student's Answer: "${readingAnswer}"

**Part 2: Listening Comprehension** (Evaluating audio understanding)
Admin Question: "${config.listeningQuestion}"
Student's Answer: "${listeningAnswer}"

**Part 3: Writing Task** (Evaluating grammar, vocabulary, and cohesion)
Admin Prompt: "${config.writingPrompt}"
Student's Essay: "${studentEssay}"

**Part 4: Speaking Task** (Evaluating pronunciation, fluency, and spoken grammar)
Admin Prompt: "${config.speakingPrompt}"
(I am attaching the user's spoken audio response as an audio file in this prompt.)

Analyze the submissions based on:
1. Reading: Did they deduce the correct contextual information?
2. Listening: Did they accurately capture the information from the audio source?
3. Writing: Is the text cohesive with a good range of grammatical structures and vocabulary?
4. Speaking: Listen to the attached audio. Evaluate their pronunciation clarity, natural fluency, and control of spoken grammar.

CRITICAL RULE: If the student's answers are completely empty, gibberish, clearly random keyboard mashing (e.g., "dajwdklaawd"), or if the audio contains no meaningful speech, YOU MUST assign the lowest level "A1" exclusively. Do not assign higher levels for lack of effort or missing answers. Asses only based on real English proficiency shown.

Based on your combined analysis of all four skills, determine the user's overall CEFR level from the following exclusively allowed values: "A1", "A2", "B1", "B2", "C1", "C2".

Return ONLY a valid JSON object with the following exact structure (no markdown fences, strictly parseable JSON):
{
  "cefrLevel": "<one of: A1, A2, B1, B2, C1, C2>",
  "feedback": "<A concise, encouraging paragraph (max 4 sentences) explicitly explaining their performance across the 4 skills (Reading, Listening, Writing, Speaking) and what they should focus on next.>"
}
`;

        let contents;
        if (audioFile && audioFile.buffer) {
            // Multimodal prompt
            contents = [
                {
                    role: "user",
                    parts: [
                        { text: systemPrompt },
                        {
                            inlineData: {
                                data: audioFile.buffer.toString("base64"),
                                mimeType: audioFile.mimetype,
                            },
                        },
                    ],
                },
            ];
        } else {
            // Fallback if no audio (should not happen due to validation)
            contents = systemPrompt;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: 'application/json',
            }
        });

        const jsonText = response.text;
        const parsedFeedback = JSON.parse(jsonText);

        const allowedLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
        const cefrLevel = allowedLevels.includes(parsedFeedback.cefrLevel) ? parsedFeedback.cefrLevel : "A1";

        return {
            cefrLevel: cefrLevel,
            feedback: parsedFeedback.feedback || 'Your English level has been evaluated.',
        };

    } catch (error) {
        console.error('AI Placement Grading Error:', error);
        return {
            cefrLevel: 'A1',
            feedback: 'An error occurred during AI evaluation. We have assigned a starter level. You can retake the test later if needed.',
        };
    }
};

module.exports = { evaluatePlacement };
