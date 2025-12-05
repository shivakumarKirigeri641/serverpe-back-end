const express = require("express");
const validateSendOtp = require("../validations/main/validateSendOtp");
const getPinCodes = require("../SQL/PINCODES/getAllPinCodes");
const generateOtp = require("../utils/generateOtp");
const generateToken = require("../utils/generateToken");
const getPostgreClient = require("../SQL/getPostgreClient");
const { connectPinCodeDB, connectMainDB } = require("../database/connectDB");
const insertotpentry = require("../SQL/main/insertotpentry");
const validateotp = require("../SQL/main/validateotp");
const validateverifyOtp = require("../validations/main/validateverifyOtp");
const checkServerPeUser = require("../middleware/checkServerPeUser");
const checkApiKey = require("../middleware/checkApiKey");
const updateApiUsage = require("../SQL/main/updateApiUsage");
const dummRouterPinCode = express.Router();
dummRouterPinCode.get(
  "/mockapis/serverpeuser/api/pincodes",
  checkApiKey,
  async (req, res) => {
    const poolmain = await connectMainDB();
    const pool = await connectPinCodeDB();
    const clientmain = await getPostgreClient(poolmain);
    const client = await getPostgreClient(pool);
    const result = await getPinCodes(client);
    //update api usage
    updateApiUsage(clientmain, req, res);
    res.json(result);
  }
);
dummRouterPinCode.post("/mockapis/serverpeuser/send-otp", async (req, res) => {
  const pool = await connectMainDB();
  const client = await getPostgreClient(pool);
  let validationresult = validateSendOtp(req.body);
  if (validationresult.successstatus) {
    //const result_otp = generateOtp();//hardcoded
    const result_otp = "1234";
    validationresult = await insertotpentry(client, req.body, result_otp);
  }
  res.status(validationresult.statuscode).json(validationresult);
});
dummRouterPinCode.post(
  "/mockapis/serverpeuser/verify-otp",
  async (req, res) => {
    const pool = await connectMainDB();
    const client = await getPostgreClient(pool);
    let validateforverifyotpresult = validateverifyOtp(req.body);
    if (validateforverifyotpresult.successstatus) {
      validateforverifyotpresult = await validateotp(
        client,
        req.body.mobile_number,
        req.body.otp
      );
      if (validateforverifyotpresult.successstatus) {
        //generate token & send back
        const serverpe_user_token = await generateToken(req.body.mobile_number);
        res.cookie("serverpe_user_token", serverpe_user_token, {
          httpOnly: true,
          secure: false, // true in production HTTPS
          sameSite: "lax",
          maxAge: 10 * 60 * 1000, // 10 minutes
        }); // 10min}))
      }
    }
    res
      .status(validateforverifyotpresult.statuscode)
      .json(validateforverifyotpresult);
  }
);
dummRouterPinCode.get(
  "/mockapis/serverpeuser/api-usage",
  checkServerPeUser,
  async (req, res) => {
    res.json({ status: "ok", message: "inside user" });
  }
);
module.exports = dummRouterPinCode;
