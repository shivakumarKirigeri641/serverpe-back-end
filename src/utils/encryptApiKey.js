const crypto = require("crypto");
const encryptApiKey = (mobile_number) => {
  if (!mobile_number) throw new Error("Mobile number required");

  // Generate random API key
  const apiKey = crypto.randomBytes(32).toString("hex"); // 64 chars

  // Encrypt API key with mobile number
  const key = crypto.createHash("sha256").update(mobile_number).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(apiKey, "utf8", "base64");
  encrypted += cipher.final("base64");
  const encryptedApiKey = iv.toString("base64") + ":" + encrypted;

  // Hash the decrypted API key to store for validation
  const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  console.log(apiKeyHash);
  return { encryptedApiKey, apiKeyHash }; // apiKey is optional, return for demo
};
module.exports = encryptApiKey;
