const express = require("express");
const path = require("path");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const parkingRouter = express.Router();
const checkStudentAPIKey = require("../middleware/checkStudentAPIKey");
require("dotenv").config();

// Import repository functions
const parkingRepo = require("../SQL/photobasedvehiclemgmt/photobasedvehiclemgmt.repo");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../images/parking");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "vehicle-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});
/**
 * GET /parking/health
 * API health check endpoint
 */
parkingRouter.get("/parking/health", (req, res) => {
  sendSuccess(
    res,
    {
      service: "Photo Based Vehicle Parking Management",
      status: "operational",
      timestamp: new Date().toISOString(),
    },
    "Service is healthy",
  );
});

module.exports = parkingRouter;
