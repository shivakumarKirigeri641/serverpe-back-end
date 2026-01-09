const express = require("express");
const studentsTrainSeatReserveRouter = express.Router();
const { getMainPool } = require("../database/connectDB");
const checkStudentLicense = require("../middleware/checkStudentLicense");

// Apply license validation middleware to ALL routes in this router
studentsTrainSeatReserveRouter.use(checkStudentLicense(getMainPool()));

/**
 * GET /mockapis/serverpeuser/api/mocktrain/reserved/stations
 * 
 * Demo endpoint for student train seat reservation
 * Protected by license + fingerprint validation
 * 
 * Required Headers/Body:
 * - x-license-key or license_key (in query/body)
 * - x-device-fingerprint or fingerprint (in headers/body)
 */
studentsTrainSeatReserveRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/stations",
  (req, res) => {
    // License info is attached by middleware
    const { licenseInfo } = req;

    res.status(200).json({
      poweredby: "serverpe.in",
      mock_data: true,
      status: "Success",
      successstatus: true,
      message: "Students Train Seat Reserve - Access Granted",
      license_info: {
        user_name: licenseInfo.user_name,
        project_title: licenseInfo.project_title,
        project_code: licenseInfo.project_code,
        first_use: licenseInfo.first_use
      },
      data: {
        reserved_stations: [
          { station_code: "SBC", station_name: "Bangalore City" },
          { station_code: "MYS", station_name: "Mysore" },
          { station_code: "HWH", station_name: "Howrah" }
        ]
      }
    });
  }
);

module.exports = studentsTrainSeatReserveRouter;
