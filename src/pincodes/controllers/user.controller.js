const { getUserByApiKey } = require("../services/user.service");

exports.getUserStatus = async (req, res) => {
  const apiKey = req.headers["x-api-key"];

  const user = await getUserByApiKey(apiKey);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const now = Date.now();

  // Calculate time to reset free quota
  const freeResetMs = user.free_quota_reset - now;
  const freeResetsIn =
    freeResetMs > 0
      ? Math.ceil(freeResetMs / (60 * 1000)) + " minutes"
      : "expired";

  // Extra quota expiry
  const extraMs = user.extra_quota_expiry - now;
  const extraExpiresIn =
    user.extra_quota > 0 ? Math.ceil(extraMs / (60 * 1000)) + " minutes" : null;

  return res.json({
    success: true,
    email: user.email,
    apiKey: user.api_key,
    dailyFreeQuota: user.daily_free_quota,
    usedToday: user.used_today,
    freeQuotaLeft: user.daily_free_quota - user.used_today,

    extraQuota: user.extra_quota,
    extraQuotaExpiresIn: extraExpiresIn,

    resetsIn: freeResetsIn,
    serverTime: new Date().toISOString(),
  });
};
