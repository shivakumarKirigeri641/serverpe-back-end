const express = require("express");
const { connectCarSpecsDB, connectMainDB } = require("../database/connectDB");
const checkApiKey = require("../middleware/checkApiKey");
const rateLimitPerApiKey = require("../middleware/rateLimitPerApiKey");
const updateApiUsage = require("../SQL/main/updateApiUsage");
const getMakes = require("../SQL/carspecs/getMakes");
const getPostgreClient = require("../SQL/getPostgreClient");
const dummyrouter = express.Router();
const poolMain = connectMainDB();
const poolCarSpecs = connectCarSpecsDB();
const getModels = require("../SQL/carspecs/getModels");
const getGrades = require("../SQL/carspecs/getGrades");
const validateForModels = require("../validations/carspecs/validateForModels");
const validateForGrades = require("../validations/carspecs/validateForGrades");
let usageStatus = {};
// ======================================================
//                api get reservation type (unchargeable)
// ======================================================
dummyrouter.get(
  "/mockapis/serverpeuser/api/carspecs/makes",
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
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-models
// ======================================================
dummyrouter.post(
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
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientCarSpecs) clientCarSpecs.release();
    }
  }
);
// ======================================================
//                api get car-grades
// ======================================================
dummyrouter.post(
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
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientCarSpecs) clientCarSpecs.release();
    }
  }
);
module.exports = dummyrouter;
