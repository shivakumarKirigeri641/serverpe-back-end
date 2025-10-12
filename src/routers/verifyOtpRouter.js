const createJwtToken = require("../utils/createJwtToken");
const express = require("express");
const verifyOtpRouter = express.Router();
const {
  verifyMobileNumber,
  getPostgreClient,
  getRandomOtp,
  connectDB,
  verifyOtpFormat,
  sendOTPSMS,
  insertOtpSessions,
  verifyEnteredOtp,
} = require("../utils/dependencies");
const insertToken = require("../SQL/insersions/insertToken");
const checkAndinsertLogin = require("../SQL/checkAndinsertLogin");
const insertLoginTracking = require("../SQL/insersions/insertLoginTracking");
const encryptApiKey = require("../utils/encryptApiKey");
const deleteTokenSessionOnMobile = require("../SQL/deleteTokenSessionOnMobile");
verifyOtpRouter.post(
  "/fakeapi/train/reserved-tickets/user/verify-otp",
  async (req, res) => {
    let client = null;
    try {
      //1. verify mobile_number and otp
      const { user_name, mobile_number, user_email, state_id, otp } = req?.body;
      if (!mobile_number) {
        throw {
          success: false,
          message: "Please provide mobile number!",
          error_details: {},
        };
      }
      if (!otp) {
        throw {
          success: false,
          message: "Invalid otp!",
          error_details: {},
        };
      }
      if (!verifyMobileNumber(mobile_number)) {
        throw {
          success: false,
          message: "Invalid mobile number!!!",
          error_details: {},
        };
      }
      if (!verifyOtpFormat(otp)) {
        throw {
          success: false,
          message: "Invalid otp number!!!",
          error_details: {},
        };
      }
      //2. check if otp is valid from query
      //& check if otp delay more then 3min
      const pool = await connectDB();
      client = await getPostgreClient(pool);
      if (!client) {
        throw {
          err_details: {
            success: false,
            message: "S1omething went wrong!",
            data: {},
          },
        };
      }
      //4. if all good, delete otp session
      const result = await verifyEnteredOtp(client, mobile_number, otp);
      if (!result.status) {
        throw {
          success: false,
          message: result?.message,
          data: {},
        };
      }

      //4. create jwt token and attach to response
      const token = await createJwtToken(mobile_number);
      //first delete if mobile number exists
      await deleteTokenSessionOnMobile(client, mobile_number);
      //5. insert into token sessions
      await insertToken(client, mobile_number, token);
      const { encryptedApiKey, apiKeyHash } = encryptApiKey(mobile_number);
      const result_data = await checkAndinsertLogin(
        client,
        user_name,
        mobile_number,
        user_email,
        state_id,
        encryptedApiKey,
        apiKeyHash.toString("hex")
      );
      res.cookie("token", token, { maxAge: 5 * 60 * 1000 });
      //5. success msg
      res.status(200).json({
        success: true,
        message: "Mobile and OTP verifed successfully.",
        data: {},
      });
    } catch (err) {
      console.log(err.message);
      if (client) {
        await client.query("ROLLBACK");
      }
      res.status(400).json(err);
    } finally {
      if (client) {
        await client.release();
      }
    }
  }
);
module.exports = verifyOtpRouter;
