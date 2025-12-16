const express = require("express");
const getTestimonials = require("../SQL/main/getTestimonials");
const insertContactMeData = require("../SQL/main/insertContactMeData");
const validateForAddingContactMeData = require("../validations/main/validateForAddingContactMeData");
const getAllFeedbackCategories = require("../SQL/main/getAllFeedbackCategories");
const validateSendOtp = require("../validations/main/validateSendOtp");
const generateToken = require("../utils/generateToken");
const getPostgreClient = require("../SQL/getPostgreClient");
const { connectMainDB } = require("../database/connectDB");
const insertotpentry = require("../SQL/main/insertotpentry");
const getStatesAndTerritories = require("../SQL/main/getStatesAndTerritories");
const validateotp = require("../SQL/main/validateotp");
const validateverifyOtp = require("../validations/main/validateverifyOtp");
const generalRouter = express.Router();
const fetchApiPlans = require("../SQL/main/fetchApiPlans");
const securityMiddleware = require("../middleware/securityMiddleware");
const getApiEndPoints = require("../SQL/main/getApiEndPoints");
require("dotenv").config();
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  reconnectOnError: () => true,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
  tls: {}, // IMPORTANT for redis.io URLs with TLS (rediss://)
});
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
        const token = generateToken(req.body.mobile_number);
        res.cookie("token", token, {
          httpOnly: true,
          secure: false, // must be false because you're not using HTTPS
          sameSite: "lax", // must be lax or strict on localhost
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
//                add to contact me
// ======================================================
generalRouter.post("/mockapis/serverpeuser/contact-me", async (req, res) => {
  let client;
  try {
    client = await getPostgreClient(poolMain);
    let resultcontactme = validateForAddingContactMeData(req);
    if (resultcontactme.successstatus) {
      resultcontactme = await insertContactMeData(
        client,
        req.body.user_name,
        req.body.email,
        req.body.category_name,
        req.body.message
      );
    }
    return res.status(resultcontactme.statuscode).json(resultcontactme);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal Server Error",
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
// ======================================================
//                api get state list (unchargeable)
// ======================================================
generalRouter.get("/mockapis/serverpeuser/states", async (req, res) => {
  let clientMain;
  try {
    clientMain = await getPostgreClient(poolMain);
    // 2️⃣ Business Logic
    const result = await getStatesAndTerritories(clientMain);
    return res.status(result.statuscode ? result.statuscode : 200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("API Error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  } finally {
    if (clientMain) clientMain.release();
  }
});
// ======================================================
//                API plans
// ======================================================
generalRouter.get("/mockapis/serverpeuser/api-plans", async (req, res) => {
  let client;
  try {
    client = await getPostgreClient(poolMain);
    const plansResult = await fetchApiPlans(client, true);
    return res.status(plansResult.statuscode).json(plansResult);
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
//                API all endpionts
// ======================================================
generalRouter.get("/mockapis/serverpeuser/all-endpoints", async (req, res) => {
  let client;
  try {
    client = await getPostgreClient(poolMain);
    const apiendpoints = await getApiEndPoints(client);
    return res.status(apiendpoints.statuscode).json(apiendpoints);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  } finally {
    if (client) client.release();
  }
});
module.exports = generalRouter;
