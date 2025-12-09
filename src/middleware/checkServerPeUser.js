const jwt = require("jsonwebtoken");
require("dotenv").config();
const checkServerPeUser = async (req, res, next) => {
  const { serverpe_user_token } = req.cookies;
  console.log(req.cookies);
  if (!serverpe_user_token) {
    res.status(401).json({
      status: "Failed",
      successstatus: false,
      message: "Token not found!",
    });
  } else {
    jwt.verify(serverpe_user_token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        // Token Expired
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Token expired" });
        }

        // Any other verification error
        return res.status(401).json({ error: "Invalid token" });
      }

      // Attach decoded user info to request object
      req.mobile_number = decoded;
      next();
    });
  }
};
module.exports = checkServerPeUser;
