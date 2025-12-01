const rateLimit = require("express-rate-limit");

exports.freeTierLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: "Free Tier limit reached. Add API Key or recharge.",
  },
});
