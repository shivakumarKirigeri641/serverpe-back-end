// finalSecurityMiddleware.js

module.exports = function securityMiddleware(redis, options = {}) {
  const {
    rateLimit = 3, // allowed requests per second
    scraperLimit = 50, // number of requests allowed per window before block
    windowSeconds = 10, // window for detecting scraping
    blockDuration = 3600, // 1 hour block
  } = options;

  return async function (req, res, next) {
    try {
      const apiKey = req.headers["x-api-key"] || "unknown";
      const userIP = req.ip;

      const blockKey = `blocked:${apiKey}:${userIP}`;
      const rateKey = `rate:${apiKey}:${userIP}`;
      const scrapeKey = `scrape:${apiKey}:${userIP}`;

      // 1️⃣ CHECK IF BLOCKED
      const isBlocked = await redis.get(blockKey);
      if (isBlocked) {
        return res.status(403).json({
          success: false,
          error: "You are temporarily blocked due to suspicious activity.",
        });
      }

      // 2️⃣ RATE LIMIT – BASIC API USAGE CONTROL
      const currentRate = await redis.incr(rateKey);
      if (currentRate === 1) {
        await redis.expire(rateKey, 1); // 1 second window
      }

      if (currentRate > rateLimit) {
        return res.status(429).json({
          success: false,
          error: "Rate limit exceeded. Slow down.",
        });
      }

      // 3️⃣ SCRAPER / LOOP DETECTION (AGGRESSIVE)
      const scrapeCount = await redis.incr(scrapeKey);
      if (scrapeCount === 1) {
        await redis.expire(scrapeKey, windowSeconds);
      }

      if (scrapeCount > scraperLimit) {
        await redis.set(blockKey, "1", "EX", blockDuration);
        return res.status(403).json({
          success: false,
          error: "You have been blocked for excessive requests.",
        });
      }

      // 🚀 SUCCESS → safe to access API
      next();
    } catch (err) {
      console.error("Security Middleware Error:", err);
      // Fail-open (do not block users if Redis has issues)
      next();
    }
  };
};
