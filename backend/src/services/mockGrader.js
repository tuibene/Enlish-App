const { GoogleGenAI } = require('@google/genai');

const evaluateMockTest = async (answers, audioFiles) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY is not set. Using fallback logic.');
            return {
                overallBand: 5.5,
                listeningBand: 5.5,
                readingBand: 5.5,
                writingBand: 5.5,
                speakingBand: 5.5,
                feedback: 'AI Evaluation is currently disabled because the API key is missing. Assigning default band 5.5.',
                targetCourseLevel: 'Intermediate'
            };
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemPrompt = `
You are an expert IELTS language examiner evaluating a student's mock test to determine their IELTS Band Score.

**Reading Answers (Max 3 items)**: ${answers.readingAnswers}
**Listening Answers (Max 3 items)**: ${answers.listeningAnswers}
**Writing Task 1**: ${answers.writingTask1}
**Writing Task 2**: ${answers.writingTask2}

I am attaching the user's spoken audio responses for Speaking. The speaking components involve answering personal questions, doing a short presentation, and having an abstract discussion.

Analyze the submissions using holistic grading since they answered fewer questions than a full standard IELTS test:
1. Reading & Listening: Did they deduce the correct answers? Assign a band score (0-9).
2. Writing: Is the text cohesive with a good range of grammatical structures and vocabulary? Evaluate Task 1 and 2, assign one overall Writing band score (0-9).
3. Speaking: Listen to the attached audio. Evaluate their pronunciation clarity, natural fluency, and control of spoken grammar. Assign a Speaking band score (0-9).

CRITICAL RULE: If any answers are completely empty, skipped, gibberish, or contain no meaningful audio/text, YOU MUST assign a score of 0.0 or 1.0 for that section. Do NOT give average bands (like 4.0-6.0) for missing work. Assess ONLY based on what is provided.

Combine these to calculate an overall band score (0-9) rounding to the nearest 0.5.
Determine their target IELTS course level recommendation from: ["Beginner", "Intermediate", "Upper Intermediate", "Advanced"]. Look for phrases that suggest this.

Return ONLY a valid JSON object with the following exact structure (no markdown fences):
{
  "overallBand": 6.5,
  "listeningBand": 6.5,
  "readingBand": 7.0,
  "writingBand": 6.0,
  "speakingBand": 6.5,
  "feedback": "A concise, encouraging paragraph explaining performance across the 4 skills and what to focus on next.",
  "targetCourseLevel": "Intermediate"
}
`;

        const parts = [ { text: systemPrompt } ];

        // Append all audio file buffers
        if (audioFiles && audioFiles.length > 0) {
            audioFiles.forEach(file => {
                parts.push({
                    inlineData: {
                        data: file.buffer.toString("base64"),
                        mimeType: file.mimetype,
                    },
                });
            });
        }

        const contents = [ { role: "user", parts: parts } ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: 'application/json',
            }
        });

        const jsonText = response.text;
        const parsedFeedback = JSON.parse(jsonText);

        return {
            overallBand: parsedFeedback.overallBand || 5.0,
            listeningBand: parsedFeedback.listeningBand || 5.0,
            readingBand: parsedFeedback.readingBand || 5.0,
            writingBand: parsedFeedback.writingBand || 5.0,
            speakingBand: parsedFeedback.speakingBand || 5.0,
            feedback: parsedFeedback.feedback || 'Your English level has been evaluated.',
            targetCourseLevel: parsedFeedback.targetCourseLevel || 'Intermediate'
        };

    } catch (error) {
        console.error('AI Mock Grading Error:', error);
        return {
            overallBand: 5.0,
            listeningBand: 5.0,
            readingBand: 5.0,
            writingBand: 5.0,
            speakingBand: 5.0,
            feedback: 'An error occurred during AI evaluation. We have assigned a starter level. You can retake the test later if needed.',
            targetCourseLevel: 'Intermediate'
        };
    }
};

module.exports = { evaluateMockTest };
