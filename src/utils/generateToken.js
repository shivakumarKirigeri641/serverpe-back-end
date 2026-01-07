const jwt = require("jsonwebtoken");
require("dotenv").config();
const generateToken = (user_id) => {
  const token = jwt.sign({ mobile_number: user_id }, process.env.SECRET_KEY, {
    expiresIn: "10m", // set expiry
  });
  return token;
};
module.exports = generateToken;
