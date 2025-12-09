const crypto = require("crypto");
const generateHash = (baseString) => {
  return crypto
    .createHash("sha256")
    .update(baseString)
    .digest("hex")
    .slice(0, 32); // truncate to 32 chars for readability
};
module.exports = generateHash;
