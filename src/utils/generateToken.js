const jwt = require("jsonwebtoken");
require("dotenv").config();
const generateToken = async (user_id) => {
  const serverpe_user_token = await jwt.sign(user_id, process.env.SECRET_KEY);
  return serverpe_user_token;
};
module.exports = generateToken;
