const express = require("express");
const getDistrictFromState = require("../SQL/PINCODES/getDistrictFromState");
const validateState = require("../validations/pincodes/validateState");
const getStatesAndTerritories = require("../SQL/PINCODES/getStatesAndTerritories");
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
const getDetailsFromPinCode = require("../SQL/PINCODES/getDetailsFromPinCode");
const checkApiKey = require("../middleware/checkApiKey");
const validatePinCode = require("../validations/pincodes/validatePinCode");
const updateApiUsage = require("../SQL/main/updateApiUsage"); // NEW ATOMIC VERSION
const getAllPinCodes = require("../SQL/PINCODES/getAllPinCodes");
const fetchApiHistory = require("../SQL/main/fetchApiHistory");
const fetchApiPlans = require("../SQL/main/fetchApiPlans");
const dummRouterPinCode = express.Router();

// 🚀 CREATE DB POOLS ONCE (CRITICAL FIX)
const poolMain = connectMainDB();
const poolPin = connectPinCodeDB();
// ======================================================
//                PINCODE details
// ======================================================
dummRouterPinCode.post(
  "/mockapis/serverpeuser/api/pincode-details",
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
      //validate
      let validatedetails = validatePinCode(req.body);
      if (validatedetails.successstatus) {
        validatedetails = await getDetailsFromPinCode(
          clientPin,
          req.body.pincode
        );
      }
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: validatedetails,
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
      const result = await getAllPinCodes(clientPin);
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
    let client;
    try {
      client = await getPostgreClient(poolMain);
      const historyResult = await fetchApiHistory(client, req.mobile_number);
      return res.status(historyResult.statuscode).json(historyResult);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (client) client.release();
    }
  }
);
// ======================================================
//                API plans premium
// ======================================================
dummRouterPinCode.get(
  "/mockapis/serverpeuser/api-plans-premium",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      client = await getPostgreClient(poolMain);
      const plansResult = await fetchApiPlans(client, false);
      return res.status(plansResult.statuscode).json(plansResult);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (client) client.release();
    }
  }
);

// ======================================================
//                api get state list
// ======================================================
dummRouterPinCode.get(
  "/mockapis/serverpeuser/api/pincodes/states",
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
      const result = await getStatesAndTerritories(clientPin);
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
//                api get district list from state parameter
// ======================================================
dummRouterPinCode.post(
  "/mockapis/serverpeuser/api/pincodes/districts",
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
      let result_for_data = validateState(req);
      if (result_for_data.successstatus) {
        result_for_data.data = await getDistrictFromState(
          clientPin,
          req.body.selectedState
        );
      }
      return res.status(result_for_data.statuscode).json({
        success: result_for_data.successstatus,
        remaining_calls: usageStatus.remaining,
        message: result_for_data.message,
        data: result_for_data?.data,
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
module.exports = dummRouterPinCode;
