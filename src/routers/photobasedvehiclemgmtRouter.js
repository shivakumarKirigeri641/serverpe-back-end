const express = require("express");
const photobasedVehicleMgmtRouter = express.Router();

// Import individual routers
const parkingRouter = require("./parkingRouter");
const tollRouter = require("./tollRouter");

/**
 * Photo Based Vehicle Management System - Combined Router
 * 
 * This router combines all endpoints from:
 * - parkingRouter: /parking/* endpoints for parking field, staff, fees, and vehicle management
 * - tollRouter: /toll/* endpoints for vehicle registry, toll plaza, lanes, and wallet management
 */

// Mount parking routes
photobasedVehicleMgmtRouter.use("/", parkingRouter);

// Mount toll routes
photobasedVehicleMgmtRouter.use("/", tollRouter);

/**
 * GET /photovehicle/health
 * Combined API health check endpoint
 */
photobasedVehicleMgmtRouter.get("/photovehicle/health", (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Service is healthy",
    data: {
      service: "Photo Based Vehicle Management System",
      modules: ["Parking Management", "Toll Management"],
      status: "operational",
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = photobasedVehicleMgmtRouter;
