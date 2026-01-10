const crypto = require("crypto");

function generateOrderNumber({
  user_id,
  mobile_number,
  email,
  project_id
}) {
  // Date part
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  // Hash sensitive info
  const hashInput = `${mobile_number}|${email}`;
  const hash = crypto
    .createHash("sha256")
    .update(hashInput)
    .digest("hex")
    .substring(0, 6)
    .toUpperCase();

  // Add randomness for retries
  const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();

  return `SP-ORD-${date}-P${project_id}-U${user_id}-${hash}-${randomSuffix}`;
}

module.exports = generateOrderNumber;
