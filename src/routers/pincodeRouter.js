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
// ======================================================
//                PINCODE details
// ======================================================
pincodeRouter.post(
  "/mockapis/serverpeuser/api/pincode-details",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }

      // 2️⃣ Business Logic
      //validate
      let validatedetails = validatePinCode(req.body);
      if (validatedetails.successstatus) {
        validatedetails = await getDetailsFromPinCode(
          clientPin,
          req.body.pincode
        );
      }
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: validatedetails,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
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
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }

      // 2️⃣ Business Logic
      const result = await getAllPinCodes(clientPin);
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientPin) clientPin.release();
    }
  }
);
// ======================================================
//                api get state list
// ======================================================
pincodeRouter.get(
  "/mockapis/serverpeuser/api/pincodes/states",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }

      // 2️⃣ Business Logic
      const result = await getStatesAndTerritories(clientPin);
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
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
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }

      // 2️⃣ Business Logic
      let result_for_data = validateState(req);
      if (result_for_data.successstatus) {
        result_for_data.data = await getDistrictFromState(
          clientPin,
          req.body.selectedState
        );
      }
      return res.status(result_for_data.statuscode).json({
        success: result_for_data.successstatus,
        remaining_calls: usageStatus.remaining,
        message: result_for_data.message,
        data: result_for_data?.data,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
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
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }

      // 2️⃣ Business Logic
      let result_for_data = validateDistrictAndState(req);
      if (result_for_data.successstatus) {
        result_for_data.data = await getBlockFromDistrict(
          clientPin,
          req.body.selectedState,
          req.body.selectedDistrict
        );
      }
      return res.status(result_for_data.statuscode).json({
        success: result_for_data.successstatus,
        remaining_calls: usageStatus.remaining,
        message: result_for_data.message,
        data: result_for_data?.data,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
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
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }

      // 2️⃣ Business Logic
      let result_for_data = validateBlockDistrictAndState(req);
      if (result_for_data.successstatus) {
        result_for_data.data = await getBranchTypeFromBlock(
          clientPin,
          req.body.selectedState,
          req.body.selectedDistrict,
          req.body.selectedBlock
        );
      }
      return res.status(result_for_data.statuscode).json({
        success: result_for_data.successstatus,
        remaining_calls: usageStatus.remaining,
        message: result_for_data.message,
        data: result_for_data?.data,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
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
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientPin;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientPin = await getPostgreClient(poolPin);

      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }

      // 2️⃣ Business Logic
      let result_for_data = validateBranchTypeBlockDistrictAndState(req);
      if (result_for_data.successstatus) {
        result_for_data.data = await getFullDetailsFromBranchType(
          clientPin,
          req.body.selectedState,
          req.body.selectedDistrict,
          req.body.selectedBlock,
          req.body.selectedBranchType
        );
      }
      return res.status(result_for_data.statuscode).json({
        success: result_for_data.successstatus,
        remaining_calls: usageStatus.remaining,
        message: result_for_data.message,
        data: result_for_data?.data,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientPin) clientPin.release();
    }
  }
);
module.exports = pincodeRouter;
