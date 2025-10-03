const { connectDB } = require("../database/connectDB");
const getPostgreClient = require("../SQL/getPostgreClient");
const decryptApiKey = require("../utils/decryptApiKey");
const validateApiKey = require("../utils/validateApiKey");
require("dotenv").config();
const checkApiKey = async (req, res, next) => {
  let client = null;
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      throw {
        success: false,
        message: "Missing authorization header!",
        data: {},
      };
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw {
        success: false,
        message: "Invalid Authorization header format",
        data: {},
      };
    }
    const apikey = parts[1];
    if (!apikey) {
      throw {
        success: false,
        message: "Invalid user!",
        data: {},
      };
    }
    //now query to db to get mobile_number
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const result_mobile = await client.query(
      `select *from serverpe_user where api_key = $1`,
      [apikey]
    );
    if (0 === result_mobile.rows.length) {
      throw {
        success: false,
        message: "User not found!",
        data: {},
      };
    }
    //now if exists, check if api key is valid based on mobile_number?
    const isapikeyvalid = validateApiKey(
      result_mobile.rows[0].mobile_number,
      apikey,
      Buffer.from(result_mobile.rows[0].storedhash, "hex")
    );
    if (false == isapikeyvalid) {
      throw {
        success: false,
        message: "Modified api key found!",
        data: {},
      };
    }
    next();
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    res.status(401).json(err);
  } finally {
    if (client) {
      await client.release();
    }
  }
};
module.exports = checkApiKey;
