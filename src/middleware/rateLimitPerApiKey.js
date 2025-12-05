// Rate Limit: 3 requests per second per API key

const rateLimits = new Map(); // key → { count, timestamp }

const rateLimitPerApiKey = (limit = 3, windowMs = 1000) => {
  return (req, res, next) => {
    const apiKey = req.headers["x-api-key"];

    try {
      if (!apiKey) {
        return res.status(401).json({ error: "API key required" });
      }

      const now = Date.now();
      let entry = rateLimits.get(apiKey);

      if (!entry) {
        entry = { count: 1, timestamp: now };
        rateLimits.set(apiKey, entry);
        return next();
      }

      // If current window expired → reset
      if (now - entry.timestamp > windowMs) {
        entry.count = 1;
        entry.timestamp = now;
        return next();
      }

      // Still in the same 1-second window → check limit
      if (entry.count >= limit) {
        return res.status(429).json({
          error: "Too many requests. Slow down.",
        });
      }

      entry.count++;
      next();
    } catch (err) {
      console.log(err);
    }
  };
};

module.exports = rateLimitPerApiKey;
