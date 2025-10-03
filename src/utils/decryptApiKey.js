const crypto = require("crypto");
const decryptApiKey = (encryptedApiKey, mobile_number) => {
  const [ivBase64, encrypted] = encryptedApiKey.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const key = crypto.createHash("sha256").update(mobile_number).digest();

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
module.exports = decryptApiKey;
