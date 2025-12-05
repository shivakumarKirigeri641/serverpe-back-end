const express = require("express");
const validateSendOtp = require("../validations/main/validateSendOtp");
const getPinCodes = require("../SQL/PINCODES/getAllPinCodes");
const generateOtp = require("../utils/generateOtp");
const generateToken = require("../utils/generateToken");
const getPostgreClient = require("../SQL/getPostgreClient");
const { connectPinCodeDB, connectMainDB } = require("../database/connectDB");
const insertotpentry = require("../SQL/main/insertotpentry");
const rateLimitPerApiKey = require("../middleware/rateLimitPerApiKey");
const validateotp = require("../SQL/main/validateotp");
const validateverifyOtp = require("../validations/main/validateverifyOtp");
const checkServerPeUser = require("../middleware/checkServerPeUser");
const checkApiKey = require("../middleware/checkApiKey");
const updateApiUsage = require("../SQL/main/updateApiUsage"); // NEW ATOMIC VERSION
const dummRouterPinCode = express.Router();

// 🚀 CREATE DB POOLS ONCE (CRITICAL FIX)
const poolMain = connectMainDB();
const poolPin = connectPinCodeDB();

// ======================================================
//                PINCODE API (FIXED)
// ======================================================
dummRouterPinCode.get(
  "/mockapis/serverpeuser/api/pincodes",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }

      // 2️⃣ Business Logic
      const result = await getPinCodes(clientPin);

      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientPin) clientPin.release();
    }
  }
);

// ======================================================
//                SEND OTP
// ======================================================
dummRouterPinCode.post("/mockapis/serverpeuser/send-otp", async (req, res) => {
  let client;
  try {
    client = await getPostgreClient(poolMain);
    let validationresult = validateSendOtp(req.body);

    if (validationresult.successstatus) {
      const result_otp = "1234"; // static for now
      validationresult = await insertotpentry(client, req.body, result_otp);
    }

    return res.status(validationresult.statuscode).json(validationresult);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
});

// ======================================================
//                VERIFY OTP
// ======================================================
dummRouterPinCode.post(
  "/mockapis/serverpeuser/verify-otp",
  async (req, res) => {
    let client;
    try {
      client = await getPostgreClient(poolMain);

      let validateforverifyotpresult = validateverifyOtp(req.body);
      if (validateforverifyotpresult.successstatus) {
        validateforverifyotpresult = await validateotp(
          client,
          req.body.mobile_number,
          req.body.otp
        );
        if (validateforverifyotpresult.successstatus) {
          const serverpe_user_token = await generateToken(
            req.body.mobile_number
          );
          res.cookie("serverpe_user_token", serverpe_user_token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 10 * 60 * 1000,
          });
        }
      }

      return res
        .status(validateforverifyotpresult.statuscode)
        .json(validateforverifyotpresult);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (client) client.release();
    }
  }
);

// ======================================================
//                API USAGE
// ======================================================
dummRouterPinCode.get(
  "/mockapis/serverpeuser/api-usage",
  checkServerPeUser,
  async (req, res) => {
    res.json({ status: "ok", message: "inside user" });
  }
);

module.exports = dummRouterPinCode;
