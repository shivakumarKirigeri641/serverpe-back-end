const express = require("express");
const { connectCarSpecsDB, connectMainDB } = require("../database/connectDB");
const checkApiKey = require("../middleware/checkApiKey");
const rateLimitPerApiKey = require("../middleware/rateLimitPerApiKey");
const updateApiUsage = require("../SQL/main/updateApiUsage");
const getMakes = require("../SQL/carspecs/getMakes");
const getPostgreClient = require("../SQL/getPostgreClient");
const carspecrouter = express.Router();
const poolMain = connectMainDB();
const poolCarSpecs = connectCarSpecsDB();
const getModels = require("../SQL/carspecs/getModels");
const getSeries = require("../SQL/carspecs/getSeries");
const getGrades = require("../SQL/carspecs/getGrades");
const getCarList = require("../SQL/carspecs/getCarList");
const getCarSpecs = require("../SQL/carspecs/getCarSpecs");
const searchCars = require("../SQL/carspecs/searchCars");
const validateForModels = require("../validations/carspecs/validateForModels");
const validateForSeries = require("../validations/carspecs/validateForSeries");
const validateForGrades = require("../validations/carspecs/validateForGrades");
const validateForCarList = require("../validations/carspecs/validateForCarList");
const validateForCarSpecs = require("../validations/carspecs/validateForCarSpecs");
const validateForSearchCars = require("../validations/carspecs/validateForSearchCars");
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
//                api get reservation type (unchargeable)
// ======================================================
carspecrouter.get(
  "/mockapis/serverpeuser/api/carspecs/car-makes",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      //clientMain = await getPostgreClient(poolMain);
      //clientCarSpecs = await getPostgreClient(poolCarSpecs);
      const result = await getMakes(poolCarSpecs);
      /*if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(poolMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({poweredby:'serverpe.in', mock_data:true, 
            error: usageStatus.message,
          });
        }
      }*/
      return res
        .status(result.statuscode ? result.statuscode : 200)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          success: true,
          data: result,
        });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          error: "Internal Server Error",
          message: err.message,
        });
    } finally {
      //if (clientMain) clientMain.release();
      //if (poolCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-models
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/car-models",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      const start = Date.now();
      //clientMain = await getPostgreClient(poolMain);
      //clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForModels(req);
      if (result.successstatus) {
        result = await getModels(poolCarSpecs, req.body.brand);
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(poolMain, req, start);
        if (!usageStatus.ok) {
          return res
            .status(429)
            .json({
              poweredby: "serverpe.in",
              mock_data: true,
              error: usageStatus.message,
            });
        }
      }
      return res
        .status(result.statuscode ? result.statuscode : 200)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          success: true,
          remaining_calls: usageStatus?.remaining,
          data: result,
        });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          error: "Internal Server Error",
          message: err.message,
        });
    } finally {
      //if (clientMain) clientMain.release();
      //if (poolCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-series
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/car-series",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      const start = Date.now();
      //clientMain = await getPostgreClient(poolMain);
      //clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForSeries(req);
      if (result.successstatus) {
        result = await getSeries(poolCarSpecs, req.body.brand, req.body.model);
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(poolMain, req, start);
        if (!usageStatus.ok) {
          return res
            .status(429)
            .json({
              poweredby: "serverpe.in",
              mock_data: true,
              error: usageStatus.message,
            });
        }
      }
      return res
        .status(result.statuscode ? result.statuscode : 200)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          success: true,
          remaining_calls: usageStatus?.remaining,
          data: result,
        });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          error: "Internal Server Error",
          message: err.message,
        });
    } finally {
      //if (clientMain) clientMain.release();
      //if (poolCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-grades
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/car-grades",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      const start = Date.now();
      //clientMain = await getPostgreClient(poolMain);
      //clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForGrades(req);
      if (result.successstatus) {
        result = await getGrades(
          poolCarSpecs,
          req.body.brand,
          req.body.model,
          req.body.series
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(poolMain, req, start);
        if (!usageStatus.ok) {
          return res
            .status(429)
            .json({
              poweredby: "serverpe.in",
              mock_data: true,
              error: usageStatus.message,
            });
        }
      }
      return res
        .status(result.statuscode ? result.statuscode : 200)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          success: true,
          remaining_calls: usageStatus?.remaining,
          data: result,
        });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          error: "Internal Server Error",
          message: err.message,
        });
    } finally {
      //if (clientMain) clientMain.release();
      //if (poolCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-list
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/car-list",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      const start = Date.now();
      //clientMain = await getPostgreClient(poolMain);
      //clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForCarList(req);
      if (result.successstatus) {
        result = await getCarList(
          poolCarSpecs,
          req.body.brand,
          req.body.model,
          req.body.series,
          req.body.grade
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(poolMain, req, start);
        if (!usageStatus.ok) {
          return res
            .status(429)
            .json({
              poweredby: "serverpe.in",
              mock_data: true,
              error: usageStatus.message,
            });
        }
      }
      return res
        .status(result.statuscode ? result.statuscode : 200)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          success: true,
          remaining_calls: usageStatus?.remaining,
          data: result,
        });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          error: "Internal Server Error",
          message: err.message,
        });
    } finally {
      //if (clientMain) clientMain.release();
      //if (poolCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-SPECS
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/car-specs",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      const start = Date.now();
      //clientMain = await getPostgreClient(poolMain);
      //clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForCarSpecs(req);
      if (result.successstatus) {
        result = await getCarSpecs(poolCarSpecs, req.body.id);
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(poolMain, req, start);
        if (!usageStatus.ok) {
          return res
            .status(429)
            .json({
              poweredby: "serverpe.in",
              mock_data: true,
              error: usageStatus.message,
            });
        }
      }
      return res
        .status(result.statuscode ? result.statuscode : 200)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          success: true,
          remaining_calls: usageStatus?.remaining,
          data: result,
        });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          error: "Internal Server Error",
          message: err.message,
        });
    } finally {
      //if (clientMain) clientMain.release();
      //if (poolCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-search
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/search-cars",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      const start = Date.now();
      //clientMain = await getPostgreClient(poolMain);
      //clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForSearchCars(req);
      if (result.successstatus) {
        const q = req.body.query?.trim() || "";
        const limit = parseInt(req.body.limit) || 20;
        const skip = parseInt(req.body.skip) || 0;
        const canSearchByWholeWord = req.body.canSearchByWholeWord || false;
        const canSearchByContent = req.body.canSearchByContent || true;
        result = await searchCars(
          poolCarSpecs,
          q,
          limit,
          skip,
          canSearchByWholeWord,
          canSearchByContent
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(poolMain, req, start);
        if (!usageStatus.ok) {
          return res
            .status(429)
            .json({
              poweredby: "serverpe.in",
              mock_data: true,
              error: usageStatus.message,
            });
        }
      }
      return res
        .status(result.statuscode ? result.statuscode : 200)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          success: true,
          remaining_calls: usageStatus?.remaining,
          data: result,
        });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({
          poweredby: "serverpe.in",
          mock_data: true,
          error: "Internal Server Error",
          message: err.message,
        });
    } finally {
      //if (clientMain) clientMain.release();
      //if (poolCarSpecs) clientCarSpecs.release();
    }
  }
);
module.exports = carspecrouter;
