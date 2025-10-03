const jwt = require("jsonwebtoken");
const { connectDB } = require("../database/connectDB");
const convert_timeStamp_without_timezoneToIndian = require("../utils/convert_timeStamp_without_timezoneToIndian");
const getTimeDifferenceInMinutes = require("../utils/getTimeDifferenceInMinutes");
const getPostgreClient = require("../SQL/getPostgreClient");
const deleteTokenSession = require("../SQL/deleteTokenSession");
const deleteTokenSessionOnMobile = require("../SQL/deleteTokenSessionOnMobile");
const updateeTokenSession = require("../SQL/updateeTokenSession");
const getTokenDetails = require("../SQL/getTokenDetails");
require("dotenv").config();
const checkUserAuthentication = async (req, res, next) => {
  let client = null;
  try {
    const { token } = req.cookies;
    if (!token) {
      throw {
        success: false,
        message: "No Session found! Please re-login",
        data: {},
      };
    }
    const result = await jwt.verify(token, process.env.SECRET_KEY);
    const pool = await connectDB();
    client = await getPostgreClient(pool);

    const result_from_db = await getTokenDetails(client, token);
    if (0 === result_from_db.rows.length) {
      throw {
        success: false,
        message: "Invalid session!",
        data: {},
      };
    }
    if (
      result_from_db.rows[0].generated_token.toString() === token.toString()
    ) {
      //now check for last active state
      //if beyond 5min, then throw session expired.
      let created_dateandtime = convert_timeStamp_without_timezoneToIndian(
        result_from_db.rows[0].updatedat
      );
      if (getTimeDifferenceInMinutes(new Date(), created_dateandtime) >= 5) {
        //remove entry from db
        await deleteTokenSession(client, token);
        throw {
          status: false,
          message: "OTP is expired, please re-login!",
          data: {},
        };
      } else {
        await updateeTokenSession(client, token);
      }
    } else {
      throw {
        success: false,
        message: "Invalid session found!",
        data: {},
      };
    }
    //now fetch token from db and compare and equal , check for last active timestamp

    //validate the api key and then next othrwise throw error not a valid user
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
module.exports = checkUserAuthentication;
