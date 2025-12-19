const { connectMainDB } = require("../database/connectDB");
const getPostgreClient = require("../SQL/getPostgreClient");
const demoCorsMiddleware = require("./demoCorsMiddleware");

// middleware/apiKey.js
const checkApiKey = async (req, res, next) => {
  const pool = await connectMainDB();
  const client = await getPostgreClient(pool);
  const apiKey = req.headers["x-api-key"];
  const secretKey = req.headers["x-secret-key"];
  try {
    // 1️⃣ Validate API Key
    if (!apiKey) {
      return res.status(401).json({ error: "API key missing" });
    }

    // 2️⃣ Validate Secret Key
    if (!secretKey) {
      return res.status(401).json({ error: "Secret key missing" });
    }

    //check now
    const result = await client.query(
      `select *from serverpe_user where apikey_text = $1 and secret_key=$2`,
      [apiKey, secretKey]
    );
    //if demo key & all good say next();
    return demoCorsMiddleware(req, res, next);
    //normal paid api or demo api
    if (0 < result.rows.length) {
      next();
    } else {
      res
        .status(422)
        .json({ status: "Failed", message: "Invalid api key or secret key" });
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports = checkApiKey;
