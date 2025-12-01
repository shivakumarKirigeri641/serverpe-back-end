const { connectMainDB } = require("../db/connectMainDB");
// main DB where users table lives

// Fetch user by API key
exports.getUserByApiKey = async (apiKey) => {
  const db = await connectMainDB();

  const { rows } = await db.query(
    `SELECT 
        user_id,
        api_key,
        daily_free_quota,
        used_today,
        free_quota_reset,
        extra_quota,
        extra_quota_expiry
     FROM users
     WHERE api_key = $1
     LIMIT 1`,
    [apiKey]
  );

  return rows[0] || null;
};

// Deduct quota depending on type: "free" or "extra"
exports.deductQuota = async (apiKey, type) => {
  const db = await connectMainDB();

  if (type === "extra") {
    await db.query(
      `UPDATE users 
       SET extra_quota = extra_quota - 1
       WHERE api_key = $1`,
      [apiKey]
    );
  } else if (type === "free") {
    await db.query(
      `UPDATE users 
       SET used_today = used_today + 1
       WHERE api_key = $1`,
      [apiKey]
    );
  }
};

// Reset daily free quota (optional helper)
exports.resetDailyQuota = async (apiKey) => {
  const db = await connectMainDB();

  await db.query(
    `UPDATE users
     SET used_today = 0,
         free_quota_reset = $2
     WHERE api_key = $1`,
    [apiKey, Date.now() + 24 * 60 * 60 * 1000]
  );
};

// Add recharge pack (₹15/₹29/₹69/₹169)
exports.addRecharge = async (apiKey, amount) => {
  const db = await connectMainDB();

  // Recharge mapping
  const packs = {
    15: 150,
    29: 400,
    69: 1000,
    169: 2500,
  };

  const extra = packs[amount];
  const expiry = Date.now() + 24 * 60 * 60 * 1000;

  if (!extra) return null;

  await db.query(
    `UPDATE users
     SET extra_quota = extra_quota + $2,
         extra_quota_expiry = $3
     WHERE api_key = $1`,
    [apiKey, extra, expiry]
  );

  return { added: extra, expiresAt: expiry };
};
