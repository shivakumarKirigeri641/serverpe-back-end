/**
 * Photo Based Vehicle Management System - Repository Index
 * 
 * This module re-exports all repository functions from:
 * - parking.repo.js: Parking field, staff, fees, and vehicle entry/exit management
 * - toll.repo.js: Vehicle registry, toll plaza, lanes, and wallet management
 */

const parkingRepo = require("./parking.repo");
const tollRepo = require("./toll.repo");

module.exports = {
  // Parking Repository Functions
  parkingRepo,
  
  // Toll Repository Functions
  tollRepo,
  
  // Direct exports for backward compatibility (if needed)
  ...parkingRepo,
  ...tollRepo,
};
