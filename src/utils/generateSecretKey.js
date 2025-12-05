const crypto = require("crypto");

const generateSecretKey = async () => {
  return crypto.randomBytes(32).toString("hex");
};
module.exports = generateSecretKey;
