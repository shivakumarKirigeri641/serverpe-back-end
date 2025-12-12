const express = require("express");
const getStatesAndTerritories = require("../SQL/PINCODES/getStatesAndTerritories");
const validateSendOtp = require("../validations/main/validateSendOtp");
const generateOtp = require("../utils/generateOtp");
const generateToken = require("../utils/generateToken");
const getPostgreClient = require("../SQL/getPostgreClient");
const { connectMainDB } = require("../database/connectDB");
const insertotpentry = require("../SQL/main/insertotpentry");
const rateLimitPerApiKey = require("../middleware/rateLimitPerApiKey");
const validateotp = require("../SQL/main/validateotp");
const validateverifyOtp = require("../validations/main/validateverifyOtp");
const checkServerPeUser = require("../middleware/checkServerPeUser");
const checkApiKey = require("../middleware/checkApiKey");
const validateForFeedbackInsert = require("../validations/main/validateForInsertFeedback"); // NEW ATOMIC VERSION
const insertFeedbacks = require("../SQL/main/insertFeedbacks");
const fetchApiHistory = require("../SQL/main/fetchApiHistory");
const fetchApiPlans = require("../SQL/main/fetchApiPlans");
const userRouter = express.Router();
const securityMiddleware = require("../middleware/securityMiddleware");
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
//                API USAGE
// ======================================================
userRouter.get(
  "/mockapis/serverpeuser/loggedinuser/api-usage",
  securityMiddleware(redis, {
    rateLimit: 1, // 1 req/sec
    scraperLimit: 5, // 50 req/10 sec
    windowSeconds: 1, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      client = await getPostgreClient(poolMain);
      const historyResult = await fetchApiHistory(client, req.mobile_number);
      return res.status(historyResult.statuscode).json(historyResult);
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
//                API plans premium
// ======================================================
userRouter.get(
  "/mockapis/serverpeuser/loggedinuser/api-plans-premium",
  securityMiddleware(redis, {
    rateLimit: 1, // 1 req/sec
    scraperLimit: 5, // 50 req/10 sec
    windowSeconds: 1, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      client = await getPostgreClient(poolMain);
      const plansResult = await fetchApiPlans(client, false);
      return res.status(plansResult.statuscode).json(plansResult);
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
//                feedbacks
// ======================================================
userRouter.post(
  "/mockapis/serverpeuser/loggedinuser/feedback",
  securityMiddleware(redis, {
    rateLimit: 1, // 1 req/sec
    scraperLimit: 5, // 50 req/10 sec
    windowSeconds: 1, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      client = await getPostgreClient(poolMain);
      let result = validateForFeedbackInsert(req);
      if (result.successstatus) {
        result = await insertFeedbacks(client, req.mobile_number, req.body);
      }
      return res.status(result.statuscode).json(result);
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
module.exports = userRouter;
