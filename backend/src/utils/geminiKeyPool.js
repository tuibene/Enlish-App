const getAvailableKeys = () => {
    const keys = [];
    if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
    if (process.env.GEMINI_API_KEY_1) keys.push(process.env.GEMINI_API_KEY_1);
    if (process.env.GEMINI_API_KEY_2) keys.push(process.env.GEMINI_API_KEY_2);
    if (process.env.GEMINI_API_KEY_3) keys.push(process.env.GEMINI_API_KEY_3);
    
    // Remove duplicates and empty strings
    return [...new Set(keys)].filter(Boolean);
};

let currentKeyIndex = 0;

/**
 * Get the next available Gemini API Key using a Round-Robin strategy.
 */
const getNextApiKey = () => {
    const keys = getAvailableKeys();
    if (keys.length === 0) return null;
    
    const key = keys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    return key;
};

module.exports = {
    getNextApiKey,
    getAvailableKeys
};
