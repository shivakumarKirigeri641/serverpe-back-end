const express = require("express");
const { connectBikeSpecsDB, connectMainDB } = require("../database/connectDB");
const checkApiKey = require("../middleware/checkApiKey");
const rateLimitPerApiKey = require("../middleware/rateLimitPerApiKey");
const updateApiUsage = require("../SQL/main/updateApiUsage");
const getMakes = require("../SQL/bikespecs/getMakes");
const getPostgreClient = require("../SQL/getPostgreClient");
const bikespecrouter = express.Router();
const poolMain = connectMainDB();
const poolbikeSpecs = connectBikeSpecsDB();
const getModels = require("../SQL/bikespecs/getModels");
const getBikeTypes = require("../SQL/bikespecs/getBikeTypes");
const getCategory = require("../SQL/bikespecs/getCategory");
const getbikeList = require("../SQL/bikespecs/getBikeList");
const getbikeSpecs = require("../SQL/bikespecs/getBikeSpecs");
const searchbikes = require("../SQL/bikespecs/searchBikes");
const validateForModels = require("../validations/bikespecs/validateForModels");
const validateForBikeType = require("../validations/bikespecs/validateForBikeType");
const validateForCategory = require("../validations/bikespecs/validateForCategory");
const validateForbikeList = require("../validations/bikespecs/validateForBikeList");
const validateForbikeSpecs = require("../validations/bikespecs/validateForBikeSpecs");
const validateForSearchbikes = require("../validations/bikespecs/validateForSearchBikes");
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
bikespecrouter.get(
  "/mockapis/serverpeuser/api/bikespecs/bike-makes",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientbikeSpecs;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientbikeSpecs = await getPostgreClient(poolbikeSpecs);
      const result = await getMakes(clientbikeSpecs);
      /*if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({poweredby:'serverpe.in', mock_data:true, 
            error: usageStatus.message,
          });
        }
      }*/
      return res.status(result.statuscode ? result.statuscode : 200).json({
        poweredby: "serverpe.in",
        mock_data: true,
        success: true,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      if (clientMain) clientMain.release();
      if (clientbikeSpecs) clientbikeSpecs.release();
    }
  }
);
// ======================================================
//                api get bike-models
// ======================================================
bikespecrouter.post(
  "/mockapis/serverpeuser/api/bikespecs/bike-models",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientbikeSpecs;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientbikeSpecs = await getPostgreClient(poolbikeSpecs);
      let result = validateForModels(req);
      if (result.successstatus) {
        result = await getModels(clientbikeSpecs, req.body.brand);
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            poweredby: "serverpe.in",
            mock_data: true,
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        poweredby: "serverpe.in",
        mock_data: true,
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      if (clientMain) clientMain.release();
      if (clientbikeSpecs) clientbikeSpecs.release();
    }
  }
);
// ======================================================
//                api get bike-type
// ======================================================
bikespecrouter.post(
  "/mockapis/serverpeuser/api/bikespecs/bike-type",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientbikeSpecs;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientbikeSpecs = await getPostgreClient(poolbikeSpecs);
      let result = validateForBikeType(req);
      if (result.successstatus) {
        result = await getBikeTypes(
          clientbikeSpecs,
          req.body.brand,
          req.body.model
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            poweredby: "serverpe.in",
            mock_data: true,
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        poweredby: "serverpe.in",
        mock_data: true,
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      if (clientMain) clientMain.release();
      if (clientbikeSpecs) clientbikeSpecs.release();
    }
  }
);
// ======================================================
//                api get bike-category
// ======================================================
bikespecrouter.post(
  "/mockapis/serverpeuser/api/bikespecs/bike-category",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientbikeSpecs;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientbikeSpecs = await getPostgreClient(poolbikeSpecs);
      let result = validateForCategory(req);
      if (result.successstatus) {
        result = await getCategory(
          clientbikeSpecs,
          req.body.brand,
          req.body.model,
          req.body.bike_type
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            poweredby: "serverpe.in",
            mock_data: true,
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        poweredby: "serverpe.in",
        mock_data: true,
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      if (clientMain) clientMain.release();
      if (clientbikeSpecs) clientbikeSpecs.release();
    }
  }
);
// ======================================================
//                api get bike-list
// ======================================================
bikespecrouter.post(
  "/mockapis/serverpeuser/api/bikespecs/bike-list",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientbikeSpecs;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientbikeSpecs = await getPostgreClient(poolbikeSpecs);
      let result = validateForbikeList(req);
      if (result.successstatus) {
        result = await getbikeList(
          clientbikeSpecs,
          req.body.brand,
          req.body.model,
          req.body.bike_type,
          req.body.category
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            poweredby: "serverpe.in",
            mock_data: true,
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        poweredby: "serverpe.in",
        mock_data: true,
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      if (clientMain) clientMain.release();
      if (clientbikeSpecs) clientbikeSpecs.release();
    }
  }
);
// ======================================================
//                api get bike-SPECS
// ======================================================
bikespecrouter.post(
  "/mockapis/serverpeuser/api/bikespecs/bike-specs",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientbikeSpecs;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientbikeSpecs = await getPostgreClient(poolbikeSpecs);
      let result = validateForbikeSpecs(req);
      if (result.successstatus) {
        result = await getbikeSpecs(clientbikeSpecs, req.body.id);
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            poweredby: "serverpe.in",
            mock_data: true,
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        poweredby: "serverpe.in",
        mock_data: true,
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      if (clientMain) clientMain.release();
      if (clientbikeSpecs) clientbikeSpecs.release();
    }
  }
);
// ======================================================
//                api get bike-search
// ======================================================
bikespecrouter.post(
  "/mockapis/serverpeuser/api/bikespecs/search-bikes",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientbikeSpecs;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientbikeSpecs = await getPostgreClient(poolbikeSpecs);
      let result = validateForSearchbikes(req);
      if (result.successstatus) {
        const q = req.body.query?.trim() || "";
        const limit = parseInt(req.body.limit) || 20;
        const skip = parseInt(req.body.skip) || 0;
        result = await searchbikes(
          clientbikeSpecs,
          req.body.query,
          req.body.limit,
          req.body.skip
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            poweredby: "serverpe.in",
            mock_data: true,
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        poweredby: "serverpe.in",
        mock_data: true,
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      if (clientMain) clientMain.release();
      if (clientbikeSpecs) clientbikeSpecs.release();
    }
  }
);
module.exports = bikespecrouter;
