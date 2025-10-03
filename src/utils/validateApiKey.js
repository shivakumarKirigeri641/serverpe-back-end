const crypto = require("crypto");
const validateApiKey = (mobileNumber, encryptedApiKey, storedHash) => {
  try {
    const [ivBase64, encrypted] = encryptedApiKey.split(":");
    const iv = Buffer.from(ivBase64, "base64");
    const key = crypto.createHash("sha256").update(mobileNumber).digest();
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    const hash = crypto.createHash("sha256").update(decrypted).digest("hex");
    return hash === storedHash.toString("hex");
  } catch (err) {
    return false;
  }
};
module.exports = validateApiKey;
