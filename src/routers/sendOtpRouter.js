const express = require("express");
const sendOtpRouter = express.Router();
const {
  verifyMobileNumber,
  getPostgreClient,
  getRandomOtp,
  connectDB,
  sendOTPSMS,
  insertOtpSessions,
} = require("../utils/dependencies");
//api for send-otp
sendOtpRouter.post(
  "/fakeapi/train/reserved-tickets/user/send-otp",
  async (req, res) => {
    let client = null;
    try {
      let { mobile_number } = req?.body;
      //1. verify mobilenumber
      if (!verifyMobileNumber(mobile_number)) {
        throw {
          success: false,
          message: "Invalid mobile number",
          data: {},
        };
      }

      //2. generate otp
      //const otp = getRandomOtp();
      const otp = 1234;

      //3. call sms api
      /*const result_of_sms = await sendOTPSMS(mobile_number, otp, 3);
    if (!result_of_sms.success) {
    throw {
        success: false,
        message: "Failed in sending OtP. Try again later",
        data: result_of_sms,
      };
    }*/
      //4. insert into otp_session
      const pool = await connectDB();
      client = await getPostgreClient(pool);
      if (!client) {
        throw {
          success: false,
          message: "Failed in sending OtP. Try again later",
          data: {},
        };
      }
      await client.query("BEGIN");
      await insertOtpSessions(client, mobile_number, otp);
      await client.query("COMMIT");
      //5. sendresponse 'otp sent'
      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        data: {},
      });
    } catch (err) {
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

module.exports = sendOtpRouter;
