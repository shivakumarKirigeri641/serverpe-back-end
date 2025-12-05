const express = require("express");
const validateSendOtp = require("../validations/main/validateSendOtp");
const getPinCodes = require("../SQL/PINCODES/getAllPinCodes");
const generateOtp = require("../utils/generateOtp");
const getPostgreClient = require("../SQL/getPostgreClient");
const { connectPinCodeDB, connectMainDB } = require("../database/connectDB");
const insertotpentry = require("../SQL/main/insertions/insertotpentry");
const validateotp = require("../SQL/main/fetchers/validateotp");
const validateverifyOtp = require("../validations/main/validateverifyOtp");
const dummRouterPinCode = express.Router();
dummRouterPinCode.get("/pincodes", async (req, res) => {
  const pool = await connectPinCodeDB();
  const client = await getPostgreClient(pool);
  const result = await getPinCodes(client);
  res.json(result);
});
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
      }
    }
    res
      .status(validateforverifyotpresult.statuscode)
      .json(validateforverifyotpresult);
  }
);
module.exports = dummRouterPinCode;
