const jwt = require("jsonwebtoken");
require("dotenv").config();
const createJwtToken = async (mobile_number) => {
  try {
    const token = await jwt.sign({ mobile_number }, process.env.SECRET_KEY);
    return token;
  } catch (err) {
    throw err;
  }
};
module.exports = createJwtToken;
