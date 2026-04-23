/**
 * AI Rate Limiter Middleware
 * 
 * Limits the number of AI requests per user within a rolling time window.
 * Uses in-memory storage — suitable for single-server deployments.
 */

const rateLimitStore = new Map();

// Clean up expired entries every 10 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now - data.windowStart > data.windowMs * 2) {
            rateLimitStore.delete(key);
        }
    }
}, 10 * 60 * 1000);

/**
 * Creates a rate limiter middleware for AI endpoints.
 * @param {Object} options
 * @param {number} options.maxRequests - Max requests per window (default: 20)
 * @param {number} options.windowMs - Time window in ms (default: 15 minutes)
 * @param {string} options.endpointName - Name for logging (default: 'AI')
 */
const createAiRateLimiter = ({
    maxRequests = 20,
    windowMs = 15 * 60 * 1000,
    endpointName = 'AI'
} = {}) => {
    return (req, res, next) => {
        const userId = req.user?._id?.toString() || req.ip;
        const key = `${endpointName}:${userId}`;
        const now = Date.now();

        let userData = rateLimitStore.get(key);

        if (!userData || (now - userData.windowStart) > windowMs) {
            // New window
            userData = { windowStart: now, count: 0, windowMs };
            rateLimitStore.set(key, userData);
        }

        userData.count++;

        const remaining = Math.max(0, maxRequests - userData.count);
        const resetTime = new Date(userData.windowStart + windowMs);

        // Set rate limit headers
        res.set({
            'X-RateLimit-Limit': maxRequests,
            'X-RateLimit-Remaining': remaining,
            'X-RateLimit-Reset': resetTime.toISOString(),
        });

        if (userData.count > maxRequests) {
            const retryAfterSec = Math.ceil((userData.windowStart + windowMs - now) / 1000);
            console.warn(`[RateLimit] ${endpointName}: User ${userId} exceeded ${maxRequests} requests. Reset in ${retryAfterSec}s.`);
            return res.status(429).json({
                error: `Bạn đã gửi quá nhiều yêu cầu AI. Vui lòng chờ ${Math.ceil(retryAfterSec / 60)} phút và thử lại.`,
                retryAfterSeconds: retryAfterSec,
            });
        }

        next();
    };
};

// Pre-configured limiters for different endpoints
const chatLimiter = createAiRateLimiter({ maxRequests: 30, windowMs: 15 * 60 * 1000, endpointName: 'Chat' });
const explainLimiter = createAiRateLimiter({ maxRequests: 40, windowMs: 15 * 60 * 1000, endpointName: 'Explain' });
const gradingLimiter = createAiRateLimiter({ maxRequests: 10, windowMs: 15 * 60 * 1000, endpointName: 'Grading' });
const speakLimiter = createAiRateLimiter({ maxRequests: 10, windowMs: 15 * 60 * 1000, endpointName: 'Speak' });

module.exports = {
    createAiRateLimiter,
    chatLimiter,
    explainLimiter,
    gradingLimiter,
    speakLimiter,
};
