const asyncHandler = require('express-async-handler');
const { getNextApiKey } = require('../utils/geminiKeyPool');
const { callGeminiWithRetry } = require('../utils/geminiClient');
const { explainCache, gradingCache } = require('../utils/aiCache');

// @desc    Process chat message with AI Tutor
// @route   POST /api/ai-tutor
// @access  Private
const chatWithTutor = asyncHandler(async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400);
        throw new Error('Chat messages array is required.');
    }

    try {
        if (!getNextApiKey()) {
            return res.json({
                text: "I am a fallback AI (Gemini key missing). I see what you said: " + messages[messages.length - 1]?.content
            });
        }

        const systemInstruction = `You are an expert, encouraging, and friendly English language tutor named "EngPrep AI". 
You are chatting with an English learner. 
Your goal is to converse with them naturally, ask engaging questions to keep the conversation going, and gently correct any major grammatical or lexical mistakes they make in a supportive way.
Never break character. If they make a grammar mistake, format your correction briefly (e.g. *Tip: You should say "I went" instead of "I goed"*), and then continue the conversation.
Keep your responses concise, conversational, and accessible (B1 level vocabulary unless they use higher).`;

        // Format history for Gemini API. Gemini expects role: 'user' or 'model'
        const chatContents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const response = await callGeminiWithRetry({
            contents: chatContents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            },
            timeoutMs: 60000,
        });

        res.json({ text: response.text });

    } catch (error) {
        console.error('Error generating AI Tutor response:', error.message || error);
        
        if (error.status === 429 || error.message === 'NO_API_KEY') {
            return res.status(200).json({
                text: "⚠️ AI service is temporarily unavailable. Please wait a moment and try again."
            });
        }

        return res.status(200).json({
            text: "⚠️ I had a connection hiccup. Could you try sending that message again?"
        });
    }
});

// @desc    Explain highlighted text (Vocabulary/Grammar)
// @route   POST /api/ai-tutor/explain
// @access  Private
const explainText = asyncHandler(async (req, res) => {
    const { text, context } = req.body;

    if (!text) {
        res.status(400);
        throw new Error('Text to explain is required.');
    }

    try {
        // Check cache first to save API quota
        const cacheKey = { type: 'explain', text: text.toLowerCase().trim(), context: (context || '').toLowerCase().trim() };
        const cached = explainCache.get(cacheKey);
        if (cached) {
            console.log(`[AiCache] HIT for explain: "${text}"`);
            return res.json(cached);
        }

        if (!getNextApiKey()) {
            return res.json({
                phonetic: "",
                definition: `Fallback explanation for "${text}". Add API key for real AI.`,
                translation: `(Bản dịch mẫu cho: "${text}")`,
                grammar: "Used here as a noun phrase to indicate the core concept. Synonyms include toughness.",
                example: `This is a sample example containing the word "${text}".`
            });
        }

        const prompt = `You are a world-class English tutor. Your student (whose native language is Vietnamese) highlighted the following text: "${text}".
Context from the passage: "${context || "No context provided."}".

Analyze the highlighted text and return the result strictly as a valid JSON object with the following keys:
- "phonetic": The IPA pronunciation (if it's a short phrase or single word), otherwise just "".
- "definition": A precise English explanation of what "${text}" means in this specific context.
- "translation": The Vietnamese translation of the meaning.
- "grammar": Grammatical notes (e.g., part of speech, tense, idiom, collocations) explained concisely.
- "example": Provide one natural, professional example sentence using this exact word/phrase.

Do NOT include any markdown formatting like \`\`\`json. Return ONLY a parseable JSON object.`;

        const response = await callGeminiWithRetry({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                temperature: 0.2,
            },
            timeoutMs: 30000,
        });

        if (response && response.text) {
            let jsonString = response.text.trim();
            // Remove markdown code blocks if the AI includes them despite instructions
            if (jsonString.startsWith('\`\`\`json')) {
                jsonString = jsonString.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            } else if (jsonString.startsWith('\`\`\`')) {
                jsonString = jsonString.replace(/\`\`\`/g, '').trim();
            }

            try {
                const parsed = JSON.parse(jsonString);
                explainCache.set(cacheKey, parsed); // Cache successful response
                res.json(parsed);
            } catch (err) {
                console.error("Failed to parse AI JSON:", jsonString);
                res.json({
                    phonetic: "",
                    definition: response.text,
                    translation: "",
                    grammar: "Could not safely parse grammatical information.",
                    example: ""
                });
            }
        } else {
            throw new Error('AI produced an empty response.');
        }

    } catch (error) {
        console.error('Error generating AI text explanation:', error.message || error);

        // Handle Quota limit or other API Errors gracefully instead of crashing
        if (error.status === 429) {
            return res.status(200).json({
                phonetic: "/ɛrər/",
                definition: "API Quota Exceeded! The system has reached its daily free limit for AI requests.",
                translation: "Đã vượt quá giới hạn API! Hệ thống đã đạt giới hạn yêu cầu AI miễn phí trong ngày.",
                grammar: "Please contact the admin to upgrade the plan or try again later.",
                example: "The server received a 429 Too Many Requests response."
            });
        }

        // General fallback so the UI never breaks completely
        return res.status(200).json({
            phonetic: "",
            definition: "Failed to communicate with AI Tutor due to a server error.",
            translation: "Lỗi kết nối với Gia sư AI.",
            grammar: "Check backend server logs for more details.",
            example: ""
        });
    }
});

// @desc    Grade student essay against IELTS standards
// @route   POST /api/ai-tutor/grade-essay
// @access  Private
const gradeEssay = asyncHandler(async (req, res) => {
    const { essay, prompt: writingPrompt } = req.body;

    if (!essay || essay.trim().length < 50) {
        res.status(400);
        throw new Error('Essay is too short or empty.');
    }

    try {
        // Check cache to prevent duplicate essay submissions
        const essayCacheKey = { type: 'grade', essay: essay.trim().substring(0, 500), prompt: (writingPrompt || '').trim() };
        const cachedGrade = gradingCache.get(essayCacheKey);
        if (cachedGrade) {
            console.log('[AiCache] HIT for grade-essay');
            return res.json(cachedGrade);
        }

        if (!getNextApiKey()) {
            return res.json({
                score: "6.0",
                feedback: "This is a mock fallback feedback because the API key is missing. The system requires an active GenAI key to accurately grade essays according to IELTS band scales.",
                improvements: [
                    { original: "fake mistake", better: "great phrase", explanation: "Because vocabulary." }
                ]
            });
        }

        const promptText = `You are an expert IELTS examiner and English teacher.
A student has submitted an essay in response to the following prompt:
"${writingPrompt || 'General Topic'}"

Here is the student's essay:
"${essay}"

Carefully evaluate the essay based on IELTS criteria (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy).
You MUST return the evaluation strictly as a valid JSON object matching exactly this schema:
{
  "score": "A string representing the overall IELTS band score, e.g., '6.5'",
  "feedback": "A string containing a comprehensive paragraph summarizing strengths and main weaknesses.",
  "improvements": [
    {
      "original": "A specific phrase or sentence from the essay that is grammatically incorrect, unnatural, or uses basic vocabulary.",
      "better": "Your suggested corrected or upgraded version of that phrase.",
      "explanation": "A very brief explanation of why this change is better."
    }
  ]
}

Provide exactly 3 to 5 critical improvements.
Do NOT include any markdown formatting like \`\`\`json. Return ONLY a parseable JSON object.`;

        const response = await callGeminiWithRetry({
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            config: {
                temperature: 0.3,
            },
            timeoutMs: 60000,
        });

        if (response && response.text) {
            let jsonString = response.text.trim();
            if (jsonString.startsWith('\`\`\`json')) {
                jsonString = jsonString.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            } else if (jsonString.startsWith('\`\`\`')) {
                jsonString = jsonString.replace(/\`\`\`/g, '').trim();
            }

            try {
                const parsed = JSON.parse(jsonString);
                gradingCache.set(essayCacheKey, parsed); // Cache successful grading
                res.json(parsed);
            } catch (err) {
                console.error("Failed to parse AI Grader JSON:", jsonString);
                throw new Error("AI returned invalid JSON format.");
            }
        } else {
            throw new Error('AI produced an empty grading response.');
        }

    } catch (error) {
        console.error('Error grading essay:', error.message || error);

        if (error.status === 429) {
            return res.status(200).json({
                score: "N/A",
                feedback: "API Quota Exceeded! The system has reached its daily free limit for AI requests. Cannot grade right now.",
                improvements: []
            });
        }

        return res.status(200).json({
            score: "Err",
            feedback: "Failed to grade the essay due to a server error. Please try again later.",
            improvements: []
        });
    }
});

const evaluateSpeech = asyncHandler(async (req, res) => {
    const { audioBase64, messages } = req.body;

    if (!audioBase64) {
        res.status(400);
        throw new Error('Audio data is required.');
    }

    try {
        if (!getNextApiKey()) {
            return res.json({
                transcript: "(Fallback Transcript: This is a fallback test since Gemini Key is missing.)",
                pronunciation_feedback: "Could not evaluate pronunciation without AI API Key.",
                grammar_corrections: "Unable to check grammar.",
                ai_response: "I see you sent an audio clip, but my AI brain is currently offline. Please add the Gemini API key!"
            });
        }

        // Ensure valid base64 (remove data:audio/... prefix if present)
        let base64Data = audioBase64;
        let mimeType = 'audio/webm'; // Assumed default from MediaRecorder
        if (base64Data.includes(',')) {
            const parts = base64Data.split(',');
            const mimeMatch = parts[0].match(/:(.*?);/);
            if (mimeMatch) mimeType = mimeMatch[1];
            base64Data = parts[1];
        }

        const promptText = `You are 'EngPrep AI', an expert English tutor. The user has provided an audio recording of them speaking.
Their goal is to improve English proficiency.
Listen to the audio and do the following:
1. Transcribe exactly what they said.
2. Evaluate their pronunciation, accent, clarity, and intonation. Give kind but specific feedback (e.g., specific words they mispronounced).
3. Identify any grammatical errors in what they said and provide corrections.
4. Reply naturally to continue the conversation based on their message.

Here are the last few messages for conversational context:
${messages && Array.isArray(messages) ? messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n') : "No previous context."}

Respond STRICTLY with a valid JSON object matching exactly this format:
{
  "transcript": "[user's exact spoken words]",
  "pronunciation_feedback": "[detailed feedback on how they sound, intonation, clarify]",
  "grammar_corrections": "[any grammar mistakes and how to fix them, or 'Perfect grammar!' if none]",
  "ai_response": "[your engaging conversation reply to them]"
}
Do NOT include any markdown formatting like \`\`\`json. Return ONLY a parsable JSON object.`;

        const response = await callGeminiWithRetry({
            contents: [
                {
                    role: 'user',
                    parts: [
                        { inlineData: { mimeType, data: base64Data } },
                        { text: promptText }
                    ]
                }
            ],
            config: {
                temperature: 0.3
            },
            timeoutMs: 60000,
        });

        if (response && response.text) {
            let jsonString = response.text.trim();
            if (jsonString.startsWith('\`\`\`json')) {
                jsonString = jsonString.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            } else if (jsonString.startsWith('\`\`\`')) {
                jsonString = jsonString.replace(/\`\`\`/g, '').trim();
            }

            try {
                const parsed = JSON.parse(jsonString);
                res.json(parsed);
            } catch (err) {
                console.error("Failed to parse Speech Evaluation Grader JSON:", jsonString);
                res.status(500);
                throw new Error("AI returned invalid JSON format.");
            }
        } else {
            throw new Error('AI produced an empty evaluation response.');
        }

    } catch (error) {
        console.error('Error evaluating speech:', error.message || error);
        
        if (error.status === 429) {
            return res.status(200).json({
                transcript: "(Audio Processing Failed)",
                pronunciation_feedback: "API Quota Exceeded! The system has reached its limit for AI requests.",
                grammar_corrections: "Please try again in a minute, or upgrade your API key if you hit the daily limit.",
                ai_response: "⚠️ I am currently overloaded due to Google's rate limits. Let's talk again in about a minute!"
            });
        }

        return res.status(200).json({
            transcript: "(Processing Error)",
            pronunciation_feedback: "A connection error occurred. Please try again.",
            grammar_corrections: "Unable to process at this time.",
            ai_response: "⚠️ I had a connection hiccup. Please try sending your audio again!"
        });
    }
});

module.exports = {
    chatWithTutor,
    explainText,
    gradeEssay,
    evaluateSpeech
};
