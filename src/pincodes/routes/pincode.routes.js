const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");

// middlewares
const { freeTierLimiter } = require("../middleware/rateLimit");
const apiKeyCheck = require("../middleware/apiKey");
const {
  validatePincode,
  validateSearch,
  validateState,
  validateDistrict,
} = require("../middleware/validate");

// controller
const PincodeController = require("../controllers/pincode.controller");

// ******** Choose one mode ********
// MODE A: Require API key for ALL routes
router.use(apiKeyCheck);

// MODE B: Without API key → free limit (uncomment if needed)
// router.use(freeTierLimiter);

// ---------- ROUTES ----------

// GET /pincode/:pincode
router.get(
  "/pincode/:pincode",
  validatePincode,
  asyncHandler(PincodeController.getByPincode)
);

// GET /pincode/state/:state
router.get(
  "/pincode/state/:state",
  validateState,
  asyncHandler(PincodeController.getByState)
);

// GET /pincode/district/:district
router.get(
  "/pincode/district/:district",
  validateDistrict,
  asyncHandler(PincodeController.getByDistrict)
);

// GET /pincode/search?state=&district=&pincode=
router.get(
  "/pincode/search",
  validateSearch,
  asyncHandler(PincodeController.search)
);

// GET /pincode/autocomplete?search=text
router.get(
  "/pincode/autocomplete",
  asyncHandler(PincodeController.autocomplete)
);

// GET /pincode/states
router.get("/pincode/states", asyncHandler(PincodeController.states));

// GET /pincode/districts/:state
router.get(
  "/pincode/districts/:state",
  validateState,
  asyncHandler(PincodeController.districtsByState)
);

// GET /pincode/random
router.get("/pincode/random", asyncHandler(PincodeController.random));

// GET /pincode/count
router.get("/pincode/count", asyncHandler(PincodeController.count));

module.exports = router;
