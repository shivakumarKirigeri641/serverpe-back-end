const rateLimitRedis = (redisClient, limit = 3, windowSec = 1) => {
  return async (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res
        .status(401)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          error: "API key required",
        });
    }

    const key = `rl:${apiKey}`;
    const now = Date.now();

    const tx = redisClient.multi();
    tx.zremrangebyscore(key, 0, now - windowSec * 1000);
    tx.zadd(key, now, `${now}`);
    tx.zcard(key);
    tx.expire(key, windowSec + 1);

    const [, , count] = await tx.exec();

    if (count > limit) {
      return res
        .status(429)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          error: "Rate limit exceeded. Try again after 1 second.",
        });
    }

    next();
  };
};

module.exports = rateLimitRedis;
