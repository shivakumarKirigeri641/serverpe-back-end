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
let usageStatus = {};
// ======================================================
//                api get reservation type (unchargeable)
// ======================================================
carspecrouter.get(
  "/mockapis/serverpeuser/api/carspecs/car-makes",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientCarSpecs = await getPostgreClient(poolCarSpecs);
      const result = await getMakes(clientCarSpecs);
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
      if (clientCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-models
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/car-models",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForModels(req);
      if (result.successstatus) {
        result = await getModels(clientCarSpecs, req.body.brand);
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-series
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/car-series",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForSeries(req);
      if (result.successstatus) {
        result = await getSeries(
          clientCarSpecs,
          req.body.brand,
          req.body.model
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-grades
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/car-grades",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForGrades(req);
      if (result.successstatus) {
        result = await getGrades(
          clientCarSpecs,
          req.body.brand,
          req.body.model,
          req.body.series
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-list
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/car-list",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForCarList(req);
      if (result.successstatus) {
        result = await getCarList(
          clientCarSpecs,
          req.body.brand,
          req.body.model,
          req.body.series,
          req.body.grade
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-SPECS
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/car-specs",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForCarSpecs(req);
      if (result.successstatus) {
        result = await getCarSpecs(clientCarSpecs, req.body.id);
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-search
// ======================================================
carspecrouter.post(
  "/mockapis/serverpeuser/api/carSpecs/search-cars",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientCarSpecs;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientCarSpecs = await getPostgreClient(poolCarSpecs);
      let result = validateForSearchCars(req);
      if (result.successstatus) {
        const q = req.body.query?.trim() || "";
        const limit = parseInt(req.body.limit) || 20;
        const skip = parseInt(req.body.skip) || 0;
        result = await searchCars(
          clientCarSpecs,
          req.body.query,
          req.body.limit,
          req.body.skip
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus?.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientCarSpecs) clientCarSpecs.release();
    }
  }
);
module.exports = carspecrouter;
