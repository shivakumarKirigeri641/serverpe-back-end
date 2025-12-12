const express = require("express");
const getDistrictFromState = require("../SQL/PINCODES/getDistrictFromState");
const validateState = require("../validations/pincodes/validateState");
const getBlockFromDistrict = require("../SQL/PINCODES/getBlockFromDistrict");
const validateDistrictAndState = require("../validations/pincodes/validateDistrictAndState");
const getBranchTypeFromBlock = require("../SQL/PINCODES/getBranchTypeFromBlock");
const validateBlockDistrictAndState = require("../validations/pincodes/validateBlockDistrictAndState");
const getFullDetailsFromBranchType = require("../SQL/PINCODES/getFullDetailsFromBranchType");
const validateBranchTypeBlockDistrictAndState = require("../validations/pincodes/validateBranchTypeBlockDistrictAndState");
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
const pincodeRouter = express.Router();
const poolMain = connectMainDB();
const poolPin = connectPinCodeDB();
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

let usageStatus = {};
// ======================================================
//                PINCODE details
// ======================================================
pincodeRouter.post(
  "/mockapis/serverpeuser/api/pincode-details",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 2️⃣ Business Logic
      //validate
      let result = validatePinCode(req.body);
      if (result.successstatus) {
        result = await getDetailsFromPinCode(clientPin, req.body.pincode);
      }
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: validatedetails,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientPin) clientPin.release();
    }
  }
);
// ======================================================
//                PINCODE API (FIXED)
// ======================================================
pincodeRouter.get(
  "/mockapis/serverpeuser/api/pincodes",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);
      // 2️⃣ Business Logic
      const result = await getAllPinCodes(clientPin);
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientPin) clientPin.release();
    }
  }
);
// ======================================================
//                api get state list (unchargeable)
// ======================================================
pincodeRouter.get(
  "/mockapis/serverpeuser/api/pincodes/states",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 2️⃣ Business Logic
      const result = await getStatesAndTerritories(clientPin);
      /*if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }*/
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
      if (clientPin) clientPin.release();
    }
  }
);
// ======================================================
//                api get district list from state parameter
// ======================================================
pincodeRouter.post(
  "/mockapis/serverpeuser/api/pincodes/districts",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 1️⃣ Atomic usage deduction (fixed)
      usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }

      // 2️⃣ Business Logic
      let result = validateState(req);
      if (result.successstatus) {
        result = await getDistrictFromState(clientPin, req.body.selectedState);
      }
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: result.successstatus,
        remaining_calls: usageStatus.remaining,
        message: result.message,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientPin) clientPin.release();
    }
  }
);
// ======================================================
//                api get block list from state & district parameter
// ======================================================
pincodeRouter.post(
  "/mockapis/serverpeuser/api/pincodes/blocks",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 2️⃣ Business Logic
      let result = validateDistrictAndState(req);
      if (result.successstatus) {
        result = await getBlockFromDistrict(
          clientPin,
          req.body.selectedState,
          req.body.selectedDistrict
        );
      }
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: result.successstatus,
        remaining_calls: usageStatus.remaining,
        message: result.message,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientPin) clientPin.release();
    }
  }
);
// ======================================================
//                api get branchtype list from state & district & block parameter
// ======================================================
pincodeRouter.post(
  "/mockapis/serverpeuser/api/pincodes/branchtypes",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 2️⃣ Business Logic
      let result = validateBlockDistrictAndState(req);
      if (result.successstatus) {
        result = await getBranchTypeFromBlock(
          clientPin,
          req.body.selectedState,
          req.body.selectedDistrict,
          req.body.selectedBlock
        );
      }
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: result.successstatus,
        remaining_calls: usageStatus.remaining,
        message: result.message,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientPin) clientPin.release();
    }
  }
);
// ======================================================
//                api get full details from  state & district & block & branchtype parameter
// ======================================================
pincodeRouter.post(
  "/mockapis/serverpeuser/api/pincodes/pincode-list",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 2️⃣ Business Logic
      let result = validateBranchTypeBlockDistrictAndState(req);
      if (result.successstatus) {
        result = await getFullDetailsFromBranchType(
          clientPin,
          req.body.selectedState,
          req.body.selectedDistrict,
          req.body.selectedBlock,
          req.body.selectedBranchType
        );
      }
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: result.successstatus,
        remaining_calls: usageStatus.remaining,
        message: result.message,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientPin) clientPin.release();
    }
  }
);
module.exports = pincodeRouter;
