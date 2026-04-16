const { GoogleGenAI } = require('@google/genai');

const gradeWriting = async (promptText, studentEssay) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY is not set. Skipping AI grading.');
            return {
                score: 0,
                explanation: 'AI Grading is currently disabled because the API key is missing.',
                suggestions: ['Please configure the Gemini API Key in the backend environment.']
            };
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemPrompt = `
You are an expert English language examiner (like an IELTS or TOEIC grader).
You need to evaluate a student's writing based on the following prompt:
Prompt: "${promptText}"

Student's Essay:
"${studentEssay}"

Evaluate the essay on:
1. Task Achievement (Did they answer the prompt?)
2. Coherence and Cohesion (Is it structured well?)
3. Lexical Resource (Vocabulary)
4. Grammatical Range and Accuracy

Return ONLY a valid JSON object with the following exact structure, no markdown formatting around it:
{
  "score": <number from 0 to 10 scale of the essay quality>,
  "explanation": "<detailed text explaining the score and grammar corrections>",
  "suggestions": [
    "<suggestion 1>",
    "<suggestion 2>"
  ]
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemPrompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        const jsonText = response.text;
        const parsedFeedback = JSON.parse(jsonText);

        return {
            score: typeof parsedFeedback.score === 'number' ? parsedFeedback.score : 0,
            explanation: parsedFeedback.explanation || 'No explanation provided.',
            suggestions: Array.isArray(parsedFeedback.suggestions) ? parsedFeedback.suggestions : []
        };

    } catch (error) {
        console.error('AI Grading Error:', error);
        return {
            score: 0,
            explanation: 'An error occurred while contacting the AI grading service.',
            suggestions: ['Please try again later.']
        };
    }
};

module.exports = {
    gradeWriting
};
