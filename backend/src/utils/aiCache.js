/**
 * AI Response Cache
 * 
 * In-memory cache for AI responses to avoid duplicate API calls.
 * Best for: explainText (same word/phrase lookups) and grading (prevent re-submission).
 * 
 * Uses a simple LRU-like eviction strategy with TTL.
 */

const crypto = require('crypto');

class AiCache {
    constructor({ maxSize = 500, ttlMs = 60 * 60 * 1000 } = {}) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttlMs = ttlMs; // Default: 1 hour

        // Periodic cleanup every 30 minutes
        setInterval(() => this._cleanup(), 30 * 60 * 1000);
    }

    /**
     * Generate a deterministic cache key from input data.
     */
    _makeKey(data) {
        const normalized = JSON.stringify(data).toLowerCase().trim();
        return crypto.createHash('md5').update(normalized).digest('hex');
    }

    /**
     * Get a cached response. Returns null if not found or expired.
     */
    get(keyData) {
        const key = this._makeKey(keyData);
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (Date.now() - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return null;
        }

        // Move to end (most recently accessed)
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.value;
    }

    /**
     * Store a response in cache.
     */
    set(keyData, value) {
        const key = this._makeKey(keyData);

        // Evict oldest entries if at capacity
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now(),
        });
    }

    /**
     * Remove expired entries.
     */
    _cleanup() {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttlMs) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`[AiCache] Cleaned ${cleaned} expired entries. Size: ${this.cache.size}`);
        }
    }

    /**
     * Get cache stats for monitoring.
     */
    stats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            ttlMs: this.ttlMs,
        };
    }
}

// Singleton instances for different use cases
const explainCache = new AiCache({ maxSize: 1000, ttlMs: 2 * 60 * 60 * 1000 }); // 2 hours - vocab lookups are very cacheable
const gradingCache = new AiCache({ maxSize: 200, ttlMs: 30 * 60 * 1000 });       // 30 min - prevent accidental re-submissions

module.exports = {
    AiCache,
    explainCache,
    gradingCache,
};
