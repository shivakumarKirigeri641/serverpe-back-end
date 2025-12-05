const { connectMainDB } = require("../database/connectDB");
const getPostgreClient = require("../SQL/getPostgreClient");

// middleware/apiKey.js
const checkApiKey = async (req, res, next) => {
  const pool = await connectMainDB();
  const client = await getPostgreClient(pool);
  const apiKey = req.headers["x-api-key"];
  const secretKey = req.headers["x-secret-key"];

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
  if (0 < result.rows.length) {
    next();
  } else {
    res
      .status(401)
      .json({ status: "Failed", message: "Invalid api key or secret key" });
  }
};
module.exports = checkApiKey;
