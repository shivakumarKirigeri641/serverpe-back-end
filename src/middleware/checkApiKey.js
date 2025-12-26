const { connectMainDB } = require("../database/connectDB");
const getPostgreClient = require("../SQL/getPostgreClient");
const demoCorsMiddleware = require("./demoCorsMiddleware");

// middleware/apiKey.js
const checkApiKey = async (req, res, next) => {
  try {
    const pool = await connectMainDB();
    const apiKey = req.headers["x-api-key"];
    // 1️⃣ Validate API Key
    if (!apiKey) {
      return res.status(401).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "API key missing",
      });
    }

    //check now
    const result = await pool.query(
      `select *from serverpe_user where apikey_text = $1`,
      [apiKey]
    );
    //if demo key & all good say next();
    return demoCorsMiddleware(req, res, next);
    //normal paid api or demo api
    if (0 < result.rows.length) {
      next();
    } else {
      res.status(422).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        message: "Invalid api key",
      });
    }
  } catch (err) {
    console.log("check api key err:", err.message);
  }
};
module.exports = checkApiKey;
