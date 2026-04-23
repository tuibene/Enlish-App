const { getNextApiKey } = require('../utils/geminiKeyPool');
const { callGeminiWithRetry } = require('../utils/geminiClient');

const evaluateMockTest = async (answers, audioFiles) => {
    try {
        if (!getNextApiKey()) {
            console.warn('GEMINI_API_KEY is not set. Using fallback logic.');
            return {
                overallBand: 0,
                listeningBand: 0,
                readingBand: 0,
                writingBand: 0,
                speakingBand: 0,
                feedback: 'AI Evaluation is currently disabled because the API key is missing.',
                detailedFeedback: {
                    listening: 'No API key configured.',
                    reading: 'No API key configured.',
                    writing: 'No API key configured.',
                    speaking: 'No API key configured.'
                },
                targetCourseLevel: 'Beginner'
            };
        }

        // Parse answers safely
        let listeningData = {};
        let readingData = {};
        try { listeningData = JSON.parse(answers.listeningAnswers || '{}'); } catch (e) { listeningData = {}; }
        try { readingData = JSON.parse(answers.readingAnswers || '{}'); } catch (e) { readingData = {}; }

        const listeningCount = Object.keys(listeningData).length;
        const readingCount = Object.keys(readingData).length;
        const hasWriting1 = answers.writingTask1 && answers.writingTask1.trim().length > 20;
        const hasWriting2 = answers.writingTask2 && answers.writingTask2.trim().length > 20;
        const hasSpeaking = audioFiles && audioFiles.length > 0;

        const w1WordCount = hasWriting1 ? answers.writingTask1.trim().split(/\s+/).length : 0;
        const w2WordCount = hasWriting2 ? answers.writingTask2.trim().split(/\s+/).length : 0;

        const systemPrompt = `
You are a CERTIFIED IELTS EXAMINER. You must evaluate this student's mock test with STRICT, REALISTIC scoring aligned to official IELTS Band Descriptors (0–9 scale, 0.5 increments).

═══════════════════════════════════════════
SECTION 1: LISTENING (submitted ${listeningCount} answer(s))
═══════════════════════════════════════════
Student's answers (question_number: student_answer):
${JSON.stringify(listeningData, null, 2)}

SCORING RULES:
- Since this is a simulation with limited questions, extrapolate from the quality of answers.
- If answers are mostly empty or nonsensical: Band 0.0–2.0
- If answers show some understanding but many errors: Band 3.0–4.5
- If answers are mostly correct: Band 5.0–6.5
- If answers are all correct with precise spelling: Band 7.0–9.0
- EMPTY or NO answers = Band 0.0

═══════════════════════════════════════════
SECTION 2: READING (submitted ${readingCount} answer(s))
═══════════════════════════════════════════
Student's answers (question_number: student_answer):
${JSON.stringify(readingData, null, 2)}

SCORING RULES:
- Same logic as Listening above.
- True/False/Not Given answers must be EXACTLY correct.
- Gap-fill answers must be semantically and grammatically correct.
- EMPTY or NO answers = Band 0.0

═══════════════════════════════════════════
SECTION 3: WRITING
═══════════════════════════════════════════
Task 1 (${w1WordCount} words):
"""
${hasWriting1 ? answers.writingTask1 : '[STUDENT DID NOT WRITE ANYTHING]'}
"""

Task 2 (${w2WordCount} words):
"""
${hasWriting2 ? answers.writingTask2 : '[STUDENT DID NOT WRITE ANYTHING]'}
"""

SCORING RULES (STRICT IELTS Writing Band Descriptors):
- EMPTY/BLANK essay = Band 0.0 (NO exceptions)
- Under 50 words for Task 1 or under 100 words for Task 2 = Maximum Band 3.0
- Off-topic, copied prompt, or gibberish = Band 1.0–2.0
- Task Achievement: Does the response address ALL parts of the task?
- Coherence & Cohesion: Logical organization, paragraphing, linking devices
- Lexical Resource: Range and accuracy of vocabulary, collocations
- Grammatical Range & Accuracy: Variety and control of grammar, errors

Band 9: Expert user - fully operational command
Band 8: Very good - occasional inaccuracies
Band 7: Good - handles complex language well, some errors
Band 6: Competent - generally effective, some inaccuracies
Band 5: Modest - partial command, frequent errors
Band 4: Limited - basic competence, frequent problems
Band 3: Extremely limited - very restricted range
Band 2: Intermittent - great difficulty, barely communicates
Band 1: Non-user - essentially no ability
Band 0: Did not attempt / completely off-topic

═══════════════════════════════════════════
SECTION 4: SPEAKING
═══════════════════════════════════════════
${hasSpeaking ? `${audioFiles.length} audio recording(s) attached. Evaluate:` : '[NO AUDIO SUBMITTED - assign Band 0.0]'}

SCORING CRITERIA (if audio exists):
- Fluency & Coherence: Speed, hesitation, self-correction, logical flow
- Lexical Resource: Range of vocabulary, precise word choice
- Grammatical Range & Accuracy: Sentence structures, error frequency
- Pronunciation: Intelligibility, stress patterns, intonation

SPEAKING SCORING RULES:
- If audio is silent, contains only noise, or is unintelligible = Band 1.0–2.0
- Very short responses (under 10 seconds per part) = Maximum Band 3.0
- NO audio at all = Band 0.0

═══════════════════════════════════════════
OVERALL BAND CALCULATION
═══════════════════════════════════════════
Overall = Average of (Listening + Reading + Writing + Speaking), rounded to nearest 0.5.
Example: (6.0 + 5.5 + 5.0 + 6.0) / 4 = 5.625 → rounded to 5.5

CRITICAL INSTRUCTIONS:
1. DO NOT inflate scores. A weak student should receive a low band.
2. DO NOT give 5.0+ to empty or minimal responses.
3. Be HONEST but CONSTRUCTIVE in feedback.
4. Each detailed feedback should be 2-3 sentences, specific to the student's actual performance.

Target Course Level Rules:
- Band 0-3.5 → "Beginner"
- Band 4.0-5.0 → "Intermediate"  
- Band 5.5-6.5 → "Upper Intermediate"
- Band 7.0-9.0 → "Advanced"

Return ONLY a valid JSON object (no markdown, no code fences):
{
  "overallBand": 5.5,
  "listeningBand": 6.0,
  "readingBand": 5.5,
  "writingBand": 5.0,
  "speakingBand": 5.5,
  "feedback": "A concise overall summary paragraph (3-4 sentences).",
  "detailedFeedback": {
    "listening": "Specific feedback on listening performance.",
    "reading": "Specific feedback on reading performance.",
    "writing": "Specific feedback on writing performance, mentioning Task Achievement, Coherence, Vocabulary, and Grammar.",
    "speaking": "Specific feedback on speaking performance."
  },
  "targetCourseLevel": "Upper Intermediate"
}
`;

        const parts = [{ text: systemPrompt }];

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

        const contents = [{ role: "user", parts: parts }];

        const response = await callGeminiWithRetry({
            contents: contents,
            config: {
                responseMimeType: 'application/json',
            },
            timeoutMs: 90000,
        });

        const jsonText = response.text;
        const parsedFeedback = JSON.parse(jsonText);

        // Enforce 0 for completely empty sections
        const finalListening = listeningCount === 0 ? 0 : (parsedFeedback.listeningBand ?? 0);
        const finalReading = readingCount === 0 ? 0 : (parsedFeedback.readingBand ?? 0);
        const finalWriting = (!hasWriting1 && !hasWriting2) ? 0 : (parsedFeedback.writingBand ?? 0);
        const finalSpeaking = !hasSpeaking ? 0 : (parsedFeedback.speakingBand ?? 0);

        // Recalculate overall if we had to override
        const rawOverall = (finalListening + finalReading + finalWriting + finalSpeaking) / 4;
        const finalOverall = Math.round(rawOverall * 2) / 2; // Round to nearest 0.5

        // Determine target course level from final overall
        let targetLevel = 'Beginner';
        if (finalOverall >= 7.0) targetLevel = 'Advanced';
        else if (finalOverall >= 5.5) targetLevel = 'Upper Intermediate';
        else if (finalOverall >= 4.0) targetLevel = 'Intermediate';

        return {
            overallBand: finalOverall,
            listeningBand: finalListening,
            readingBand: finalReading,
            writingBand: finalWriting,
            speakingBand: finalSpeaking,
            feedback: parsedFeedback.feedback || 'Your test has been evaluated.',
            detailedFeedback: parsedFeedback.detailedFeedback || {
                listening: 'No detailed feedback available.',
                reading: 'No detailed feedback available.',
                writing: 'No detailed feedback available.',
                speaking: 'No detailed feedback available.'
            },
            targetCourseLevel: targetLevel
        };

    } catch (error) {
        console.error('AI Mock Grading Error:', error);
        return {
            overallBand: 0,
            listeningBand: 0,
            readingBand: 0,
            writingBand: 0,
            speakingBand: 0,
            feedback: 'An error occurred during AI evaluation. Please try again.',
            detailedFeedback: {
                listening: 'Evaluation error.',
                reading: 'Evaluation error.',
                writing: 'Evaluation error.',
                speaking: 'Evaluation error.'
            },
            targetCourseLevel: 'Beginner'
        };
    }
};

module.exports = { evaluateMockTest };
