const express = require("express");
const getTestimonials = require("../SQL/main/getTestimonials");
const getAllFeedbackCategories = require("../SQL/main/getAllFeedbackCategories");
const validateSendOtp = require("../validations/main/validateSendOtp");
const generateToken = require("../utils/generateToken");
const getPostgreClient = require("../SQL/getPostgreClient");
const { connectMainDB } = require("../database/connectDB");
const insertotpentry = require("../SQL/main/insertotpentry");
const validateotp = require("../SQL/main/validateotp");
const validateverifyOtp = require("../validations/main/validateverifyOtp");
const generalRouter = express.Router();
// 🚀 CREATE DB POOLS ONCE (CRITICAL FIX)
const poolMain = connectMainDB();
// ======================================================
//                SEND OTP
// ======================================================
generalRouter.post("/mockapis/serverpeuser/send-otp", async (req, res) => {
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
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  } finally {
    if (client) client.release();
  }
});

// ======================================================
//                VERIFY OTP
// ======================================================
generalRouter.post("/mockapis/serverpeuser/verify-otp", async (req, res) => {
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
        const serverpe_user_token = await generateToken(req.body.mobile_number);
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
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  } finally {
    if (client) client.release();
  }
});
// ======================================================
//                testimonials
// ======================================================
generalRouter.get("/mockapis/serverpeuser/testimonials", async (req, res) => {
  let client;
  try {
    client = await getPostgreClient(poolMain);
    const testimonialsdata = await getTestimonials(client);
    return res.status(testimonialsdata.statuscode).json(testimonialsdata);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
      message: err.message,
    });
  } finally {
    if (client) client.release();
  }
});
// ======================================================
//                feedback catagories
// ======================================================
generalRouter.get(
  "/mockapis/serverpeuser/feedback-categories",
  async (req, res) => {
    let client;
    try {
      client = await getPostgreClient(poolMain);
      const feedbackcategories = await getAllFeedbackCategories(client);
      return res.status(feedbackcategories.statuscode).json(feedbackcategories);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        message: err.message,
      });
    } finally {
      if (client) client.release();
    }
  }
);
module.exports = generalRouter;
