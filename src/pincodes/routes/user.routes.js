const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");

// middlewares
const apiKeyCheck = require("../middleware/apiKey");

// controller
const UserController = require("../controllers/user.controller");

// require API key for all user routes
router.use(apiKeyCheck);

// GET /user/status
router.get("/user/status", asyncHandler(UserController.getUserStatus));

module.exports = router;
