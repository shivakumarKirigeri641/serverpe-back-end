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
const updateApiUsage = require("../SQL/main/updateApiUsage"); // NEW ATOMIC VERSION

const fetchApiHistory = require("../SQL/main/fetchApiHistory");
const fetchApiPlans = require("../SQL/main/fetchApiPlans");
const userRouter = express.Router();

const poolMain = connectMainDB();
// ======================================================
//                API USAGE
// ======================================================
userRouter.get(
  "/mockapis/serverpeuser/api-usage",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      client = await getPostgreClient(poolMain);
      const historyResult = await fetchApiHistory(client, req.mobile_number);
      return res.status(historyResult.statuscode).json(historyResult);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (client) client.release();
    }
  }
);
// ======================================================
//                API plans premium
// ======================================================
userRouter.get(
  "/mockapis/serverpeuser/api-plans-premium",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      client = await getPostgreClient(poolMain);
      const plansResult = await fetchApiPlans(client, false);
      return res.status(plansResult.statuscode).json(plansResult);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (client) client.release();
    }
  }
);
module.exports = userRouter;
