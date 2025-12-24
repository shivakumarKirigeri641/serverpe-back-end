const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkServerPeUser = async (req, res, next) => {
  try {
    const token = req.cookies.token; // or serverpe_user_token

    if (!token) {
      return res
        .status(401)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          status: "Failed",
          successstatus: false,
          message: "Token not found!",
        });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Attach decoded data
    req.mobile_number = decoded.mobile_number;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);

    return res
      .status(401)
      .json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        message: "Invalid or expired token!",
      });
  }
};

module.exports = checkServerPeUser;
