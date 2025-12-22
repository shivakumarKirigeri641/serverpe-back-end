const validateForAmount = require("../validations/main/validateForAmount");
const crypto = require("crypto");
const express = require("express");
const razorpay = require("../utils/razorpay");
const getStatesAndTerritories = require("../SQL/PINCODES/getStatesAndTerritories");
const validateMobileNumber = require("../SQL/main/validateMobileNumber");
const validateSendOtp = require("../validations/main/validateSendOtp");
const generateOtp = require("../utils/generateOtp");
const generateToken = require("../utils/generateToken");
const getPostgreClient = require("../SQL/getPostgreClient");
const { connectMainDB } = require("../database/connectDB");
const insertotpentry = require("../SQL/main/insertotpentry");
const rateLimitPerApiKey = require("../middleware/rateLimitPerApiKey");
const updateUserProfile = require("../SQL/main/updateUserProfile");
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
const getUsageAnalytics = require("../SQL/main/getUsageAnalytics");
require("dotenv").config();
const Redis = require("ioredis");
const getApiEndPoints = require("../SQL/main/getApiEndPoints");
const getWalletAndRechargeInformation = require("../SQL/main/getWalletAndRechargeInformation");
const getUserDashboardData = require("../SQL/main/getUserDashboardData");
const getUserProfile = require("../SQL/main/getUserProfile");
const validateForUserProfile = require("../validations/main/validateForUserProfile");
const { default: axios } = require("axios");
const { resourceLimits } = require("worker_threads");
const insertTransactionDetails = require("../SQL/main/insertTransactionDetails");
const updateMockAPICredits = require("../SQL/main/updateMockAPICredits");
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
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      //client = await getPostgreClient(poolMain);
      const historyResult = await fetchApiHistory(poolMain, req.mobile_number);

      return res.status(historyResult.statuscode).json(historyResult);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                API plans premium
// ======================================================
userRouter.get(
  "/mockapis/serverpeuser/loggedinuser/api-plans-premium",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      //client = await getPostgreClient(poolMain);
      const plansResult = await fetchApiPlans(poolMain, false);
      return res.status(plansResult.statuscode).json(plansResult);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                feedbacks
// ======================================================
userRouter.post(
  "/mockapis/serverpeuser/loggedinuser/feedback",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      //client = await getPostgreClient(poolMain);
      if (!validateMobileNumber(poolMain, req.mobile_number)) {
        res.status(401).json({
          status: "Failed",
          successstatus: false,
          message: "Unauthorized user!",
        });
      }
      let result = validateForFeedbackInsert(req);
      if (result.successstatus) {
        result = await insertFeedbacks(poolMain, req.mobile_number, req.body);
      }
      return res.status(result.statuscode).json(result);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                get all endpoints sets in array and send to ui
// ======================================================
userRouter.get(
  "/mockapis/serverpeuser/loggedinuser/all-endpoints",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      //client = await getPostgreClient(poolMain);
      if (!validateMobileNumber(poolMain, req.mobile_number)) {
        res.status(401).json({
          status: "Failed",
          successstatus: false,
          message: "Unauthorized user!",
        });
      }
      const apiendpoints = await getApiEndPoints(poolMain);
      return res.status(apiendpoints.statuscode).json(apiendpoints);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                get wallet & recharges
// ======================================================
userRouter.get(
  "/mockapis/serverpeuser/loggedinuser/wallet-recharges",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      //client = await getPostgreClient(poolMain);
      if (!validateMobileNumber(poolMain, req.mobile_number)) {
        res.status(401).json({
          status: "Failed",
          successstatus: false,
          message: "Unauthorized user!",
        });
      }
      const result_walletrecharge = await getWalletAndRechargeInformation(
        poolMain,
        req
      );
      return res
        .status(result_walletrecharge.statuscode)
        .json(result_walletrecharge);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                usage analytics
// ======================================================
userRouter.get(
  "/mockapis/serverpeuser/loggedinuser/usage-analytics",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      //client = await getPostgreClient(poolMain);
      if (!validateMobileNumber(poolMain, req.mobile_number)) {
        res.status(401).json({
          status: "Failed",
          successstatus: false,
          message: "Unauthorized user!",
        });
      }
      const result_usageanalytics = await getUsageAnalytics(poolMain, req);
      return res
        .status(result_usageanalytics.statuscode)
        .json(result_usageanalytics);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                user dashboard data
// ======================================================
userRouter.get(
  "/mockapis/serverpeuser/loggedinuser/user-dashboard-data",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      //client = await getPostgreClient(poolMain);
      if (!validateMobileNumber(poolMain, req.mobile_number)) {
        res.status(401).json({
          status: "Failed",
          successstatus: false,
          message: "Unauthorized user!",
        });
      }
      const result_usageanalytics = await getUserDashboardData(poolMain, req);
      return res
        .status(result_usageanalytics.statuscode)
        .json(result_usageanalytics);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                user profile
// ======================================================
userRouter.get(
  "/mockapis/serverpeuser/loggedinuser/user-profile",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      //client = await getPostgreClient(poolMain);
      if (!validateMobileNumber(poolMain, req.mobile_number)) {
        res.status(401).json({
          status: "Failed",
          successstatus: false,
          message: "Unauthorized user!",
        });
      }
      const result_userprofile = await getUserProfile(poolMain, req);
      return res.status(result_userprofile.statuscode).json(result_userprofile);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                user profileupdate
// ======================================================
userRouter.put(
  "/mockapis/serverpeuser/loggedinuser/user-profile-update",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      //client = await getPostgreClient(poolMain);
      if (!validateMobileNumber(poolMain, req.mobile_number)) {
        res.status(401).json({
          status: "Failed",
          successstatus: false,
          message: "Unauthorized user!",
        });
      }
      let result_userprofile = validateForUserProfile(req);
      if (!result_userprofile.successstatus) {
        result_userprofile = await updateUserProfile(poolMain, req);
      }
      return res.status(result_userprofile.statuscode).json(result_userprofile);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                razorpay order
// ======================================================
userRouter.post(
  "/mockapis/serverpeuser/loggedinuser/razorpay/order",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      const { amount } = req.body; // amount in INR
      let result_order = validateForAmount(req);
      if (result_order.successstatus) {
        result_order = await razorpay.orders.create({
          amount: amount * 100, // INR → paise
          currency: "INR",
          receipt: `serverpe_${Date.now()}`,
          payment_capture: 1,
        });
      }
      result_order.statuscode = 200;
      return res.status(result_order.statuscode).json(result_order);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                razorpay verify
// ======================================================
userRouter.post(
  "/mockapis/serverpeuser/loggedinuser/razorpay/verify",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        // ✅ Payment verified
        return res.json({ statuscode: 200, successstatus: true });
      } else {
        return res.status(400).json({ success: false });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                razorpay order-status
// ======================================================
userRouter.post(
  "/mockapis/serverpeuser/loggedinuser/razorpay/status",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      //client = await getPostgreClient(poolMain);
      const { razorpay_payment_id } = req.body;
      let result = await razorpay.payments.fetch(razorpay_payment_id);
      result = await insertTransactionDetails(
        poolMain,
        result,
        req.mobile_number
      );

      //send greetings sms & to your self alert when user recharges
      res.status(200).json({ successstatus: true, data: result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
module.exports = userRouter;
