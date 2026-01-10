const express = require("express");
const studentsTrainSeatReserveRouter = express.Router();
const { getMainPool } = require("../database/connectDB");
const checkStudentLicenseOrAdmin = require("../middleware/checkStudentLicenseOrAdmin");
const checkStudentLicenseOnly = require("../middleware/checkStudentLicense");

// Apply flexible middleware: Admins can access without license, students need license
//studentsTrainSeatReserveRouter.use(checkStudentLicenseOnly(getMainPool()));

studentsTrainSeatReserveRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/stations",
  checkStudentLicenseOnly(getMainPool()),
  (req, res) => {
    // Check if admin accessed without license
    if (req.isAdminAccess) {
      return res.status(200).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Success",
        successstatus: true,
        message: "Students Train Seat Reserve - Admin Access",
        admin_info: {
          user_name: req.user.user_name,
          email: req.user.email
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

    // Regular student access with license
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

