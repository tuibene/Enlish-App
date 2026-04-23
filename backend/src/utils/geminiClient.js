const { GoogleGenAI } = require('@google/genai');
const { getNextApiKey } = require('./geminiKeyPool');

/**
 * Wrapper around Gemini API calls with automatic retry and key rotation.
 * 
 * - Retries up to `maxRetries` times on transient failures (429, 503, timeouts)
 * - Rotates to a different API key on each retry
 * - Includes a per-request timeout via AbortController
 * 
 * @param {Object} options
 * @param {string} options.model - Gemini model name (default: 'gemini-2.5-flash')
 * @param {any} options.contents - The prompt contents
 * @param {Object} options.config - Generation config (temperature, responseMimeType, etc.)
 * @param {number} options.timeoutMs - Per-attempt timeout in ms (default: 30000)
 * @param {number} options.maxRetries - Max retry attempts (default: 2)
 * @returns {Promise<Object>} The Gemini response object
 */
const callGeminiWithRetry = async ({
    model = 'gemini-2.5-flash',
    contents,
    config = {},
    timeoutMs = 60000,
    maxRetries = 2,
} = {}) => {
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const apiKey = getNextApiKey();
        if (!apiKey) {
            throw new Error('NO_API_KEY');
        }

        try {
            const ai = new GoogleGenAI({ apiKey });

            // Create timeout with AbortController
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const response = await ai.models.generateContent({
                model,
                contents,
                config: {
                    ...config,
                    abortSignal: controller.signal,
                },
            });

            clearTimeout(timeoutId);

            if (response && response.text) {
                return response;
            }

            throw new Error('AI produced an empty response.');

        } catch (error) {
            lastError = error;
            const status = error.status || 0;
            const isRetryable = status === 429 || status === 503 || status === 500 ||
                                error.name === 'AbortError' || error.code === 'ECONNRESET';

            console.warn(`[Gemini] Attempt ${attempt + 1}/${maxRetries + 1} failed: ${error.name || ''} status=${status} ${(error.message || '').substring(0, 80)}`);

            if (!isRetryable || attempt >= maxRetries) {
                break;
            }

            // Exponential backoff: 1s, 2s, 4s...
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
};

module.exports = { callGeminiWithRetry };
