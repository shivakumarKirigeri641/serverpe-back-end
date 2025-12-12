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
const securityMiddleware = require("../middleware/securityMiddleware");
require("dotenv").config();
const Redis = require("ioredis");
const getApiEndPoints = require("../SQL/main/getApiEndPoints");

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
generalRouter.post(
  "/mockapis/serverpeuser/send-otp",
  securityMiddleware(redis, {
    rateLimit: 1, // 1 req/sec
    scraperLimit: 5, // 50 req/10 sec
    windowSeconds: 1, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  async (req, res) => {
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
  }
);

// ======================================================
//                VERIFY OTP
// ======================================================
generalRouter.post(
  "/mockapis/serverpeuser/verify-otp",
  securityMiddleware(redis, {
    rateLimit: 1, // 1 req/sec
    scraperLimit: 5, // 50 req/10 sec
    windowSeconds: 1, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
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
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (client) client.release();
    }
  }
);
// ======================================================
//                testimonials
// ======================================================
generalRouter.get(
  "/mockapis/serverpeuser/testimonials",
  securityMiddleware(redis, {
    rateLimit: 1, // 1 req/sec
    scraperLimit: 5, // 50 req/10 sec
    windowSeconds: 1, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  async (req, res) => {
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
  }
);
// ======================================================
//                add to contact me
// ======================================================
generalRouter.post(
  "/mockapis/serverpeuser/testimonials",
  securityMiddleware(redis, {
    rateLimit: 1, // 1 req/sec
    scraperLimit: 5, // 50 req/10 sec
    windowSeconds: 1, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  async (req, res) => {
    let client;
    try {
      client = await getPostgreClient(poolMain);
      let resultcontactme = validateForAddingContactMeData(req);
      if (resultcontactme.successstatus) {
        resultcontactme = await insertContactMeData(
          client,
          req.body.user_name,
          req.body.email,
          req.body.category,
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
  }
);
// ======================================================
//                feedback catagories
// ======================================================
generalRouter.get(
  "/mockapis/serverpeuser/feedback-categories",
  securityMiddleware(redis, {
    rateLimit: 1, // 1 req/sec
    scraperLimit: 5, // 50 req/10 sec
    windowSeconds: 1, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
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
//                get all endpoints sets in array and send to ui
// ======================================================
generalRouter.get(
  "/mockapis/serverpeuser/all-endpoints",
  securityMiddleware(redis, {
    rateLimit: 1, // 1 req/sec
    scraperLimit: 5, // 50 req/10 sec
    windowSeconds: 1, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  async (req, res) => {
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
  }
);
// ======================================================
//                api get state list (unchargeable)
// ======================================================
generalRouter.get(
  "/mockapis/serverpeuser/states",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  async (req, res) => {
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
  }
);
module.exports = generalRouter;
