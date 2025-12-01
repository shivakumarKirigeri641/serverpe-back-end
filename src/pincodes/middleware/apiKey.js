const { getUserByApiKey, deductQuota } = require("../services/user.service");

module.exports = async function apiKeyCheck(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "Missing API key in header: x-api-key",
    });
  }

  const user = await getUserByApiKey(apiKey);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Invalid API key",
    });
  }

  // Check quota
  const now = Date.now();

  // Reset daily free quota
  if (now > user.freeQuotaReset) {
    user.usedToday = 0;
    user.freeQuotaReset = now + 24 * 60 * 60 * 1000;
  }

  // Expire extra quota if needed
  if (user.extraQuotaExpiry && now > user.extraQuotaExpiry) {
    user.extraQuota = 0;
  }

  // If user has extra paid quota, use that first
  if (user.extraQuota > 0) {
    await deductQuota(user.apiKey, "extra");
    return next();
  }

  // If free quota available, use that
  if (user.usedToday < user.dailyFreeQuota) {
    await deductQuota(user.apiKey, "free");
    return next();
  }

  return res.status(429).json({
    success: false,
    message: "Quota exhausted. Buy recharge to continue.",
  });
};
