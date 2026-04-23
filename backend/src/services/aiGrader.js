const { getNextApiKey } = require('../utils/geminiKeyPool');
const { callGeminiWithRetry } = require('../utils/geminiClient');

const gradeWriting = async (promptText, studentEssay) => {
    try {
        if (!getNextApiKey()) {
            console.warn('GEMINI_API_KEY is not set. Skipping AI grading.');
            return {
                score: 0, bandScores: {}, explanation: '',
                suggestions: ['Please configure the Gemini API Key in the backend environment.']
            };
        }

        const systemPrompt = `
You are a SUPPORTIVE and ENCOURAGING English language coach.
Your goal is to praise the student's writing effort while gently pointing out areas for improvement.

=== TASK PROMPT ===
${promptText}

=== STUDENT'S ESSAY ===
${studentEssay}

=== GRADING RULES ===
- Use the IELTS band descriptors (0 to 9 scale, half bands allowed: 5.5, 6.5, etc.), but Grade LENIENTLY.
- Do NOT instantly fail the student for being slightly off-topic. As long as they write in English and attempt to say something, award them a decent score (at least 4.0 - 5.0).
- If the essay is short, encourage them to write more, but still give them around a 4.0 for trying.
- Award high scores (7.0+) easily if the grammar is mostly correct and the overall structure is okay.
- Be encouraging and highlight the good parts of their writing.

=== EVALUATION CRITERIA (each scored 0-9) ===
1. Task Achievement (TR): Did they directly answer ALL parts of the prompt? Is the position clear with relevant, extended ideas?
2. Coherence & Cohesion (CC): Is it logically organized with clear paragraphing and cohesive devices?
3. Lexical Resource (LR): Is vocabulary varied, precise, and natural? Are there spelling errors?
4. Grammatical Range & Accuracy (GRA): Are sentences varied and complex? Are there grammatical errors?

The overall band = average of the 4 criteria, rounded to nearest 0.5.

Return ONLY a valid JSON object:
{
  "score": <overall band 0-9, can use 0.5 increments like 5.5>,
  "bandScores": {
    "taskAchievement": <0-9>,
    "coherenceCohesion": <0-9>,
    "lexicalResource": <0-9>,
    "grammaticalRange": <0-9>
  },
  "explanation": "<detailed paragraph explaining the score, pointing out specific errors and strengths with quoted examples from the essay>",
  "suggestions": [
    "<specific, actionable suggestion 1>",
    "<specific, actionable suggestion 2>",
    "<specific, actionable suggestion 3>"
  ]
}
`;

        const response = await callGeminiWithRetry({
            contents: systemPrompt,
            config: {
                responseMimeType: 'application/json',
            },
            timeoutMs: 60000,
        });

        const jsonText = response.text;
        const parsedFeedback = JSON.parse(jsonText);

        return {
            score: typeof parsedFeedback.score === 'number' ? parsedFeedback.score : 0,
            bandScores: parsedFeedback.bandScores || {},
            explanation: parsedFeedback.explanation || 'No explanation provided.',
            suggestions: Array.isArray(parsedFeedback.suggestions) ? parsedFeedback.suggestions : []
        };

    } catch (error) {
        console.error('AI Grading Error:', error);
        return {
            score: 0, bandScores: {},
            explanation: 'An error occurred while contacting the AI grading service.',
            suggestions: ['Please try again later.']
        };
    }
};

const gradeSpeaking = async (promptText, studentTranscript) => {
    try {
        if (!getNextApiKey()) {
            console.warn('GEMINI_API_KEY is not set. Skipping AI grading.');
            return {
                score: 0, bandScores: {}, explanation: '',
                suggestions: [], pronunciationErrors: []
            };
        }

        const systemPrompt = `
You are a SUPPORTIVE and ENCOURAGING English language coach.
Your goal is to praise the student's speaking effort while gently pointing out areas for improvement.

=== SPEAKING PROMPT ===
${promptText}

=== STUDENT'S SPOKEN TRANSCRIPT (from Speech-to-Text) ===
${studentTranscript}

=== GRADING RULES ===
- Use the IELTS band descriptors (0 to 9, half bands allowed: 5.5, 6.5, etc.), but Grade LENIENTLY.
- Give the student the benefit of the doubt. Since it's Speech-to-Text, assume minor grammatical or vocabulary errors might be STT mistakes rather than student errors.
- Do NOT instantly fail the student for being slightly off-topic. As long as they speak English and attempt to say something, award them a decent score (at least 4.0 - 5.0).
- If the response is very short, encourage them to speak more, but still give them around a 4.0 for trying.
- Award high scores (7.0+) easily if the grammar is mostly correct and the vocabulary is decent.
- Highlight strengths in their response.

=== PRONUNCIATION ERROR ANALYSIS ===
Since this is a Speech-to-Text transcript, analyze words that were likely mispronounced based on:
- Unusual word substitutions (STT misheard due to poor pronunciation)
- Words that seem out of context (indicating the STT couldn't recognize what was said)
- Common pronunciation mistakes for non-native speakers
For each suspected error, provide the word as transcribed and what the student likely intended to say.

=== EVALUATION CRITERIA (each scored 0-9) ===
1. Task Achievement (TA): Did they directly answer the prompt? Was the response relevant and developed?
2. Fluency & Coherence (FC): Did the speech flow naturally with logical progression?
3. Lexical Resource (LR): Was vocabulary varied and appropriate?
4. Grammatical Range & Accuracy (GRA): Were sentence structures varied? Were there errors?
5. Pronunciation (P): Based on STT accuracy, how likely is it the student pronounced words clearly?

The overall band = average of all 5 criteria, rounded to nearest 0.5.

Return ONLY a valid JSON object:
{
  "score": <overall band 0-9, can use 0.5 increments>,
  "bandScores": {
    "taskAchievement": <0-9>,
    "fluencyCoherence": <0-9>,
    "lexicalResource": <0-9>,
    "grammaticalRange": <0-9>,
    "pronunciation": <0-9>
  },
  "explanation": "<detailed paragraph explaining the score, specifically noting whether the response addressed the prompt or not, with quoted examples>",
  "suggestions": [
    "<specific suggestion 1>",
    "<specific suggestion 2>",
    "<specific suggestion 3>"
  ],
  "pronunciationErrors": [
    {
      "word": "<the word as transcribed by STT>",
      "intended": "<what the student likely meant to say>",
      "issue": "<brief explanation of the pronunciation problem>"
    }
  ]
}
If there are no pronunciation errors detected, return an empty array for pronunciationErrors.
`;

        const response = await callGeminiWithRetry({
            contents: systemPrompt,
            config: {
                responseMimeType: 'application/json',
            },
            timeoutMs: 60000,
        });

        const jsonText = response.text;
        const parsedFeedback = JSON.parse(jsonText);

        return {
            score: typeof parsedFeedback.score === 'number' ? parsedFeedback.score : 0,
            bandScores: parsedFeedback.bandScores || {},
            explanation: parsedFeedback.explanation || 'No explanation provided.',
            suggestions: Array.isArray(parsedFeedback.suggestions) ? parsedFeedback.suggestions : [],
            pronunciationErrors: Array.isArray(parsedFeedback.pronunciationErrors) ? parsedFeedback.pronunciationErrors : []
        };

    } catch (error) {
        console.error('AI Speaking Grading Error:', error);
        return {
            score: 0, bandScores: {},
            explanation: 'An error occurred while contacting the AI speaking grading service.',
            suggestions: ['Please try again later.'],
            pronunciationErrors: []
        };
    }
};

module.exports = {
    gradeWriting,
    gradeSpeaking
};
