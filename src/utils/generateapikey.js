const generateHash = require("./generateHash");
const crypto = require("crypto");
const generateApiKey = async (mobile_number, state_code) => {
  const stateCode = state_code || "XX";

  const randomString = crypto.randomBytes(16).toString("hex");

  const baseString = `${mobile_number}-${stateCode}-${randomString}`;

  const hash = generateHash(baseString);

  return `SPK_live_IN-${stateCode}_${hash}`;
};
module.exports = generateApiKey;
