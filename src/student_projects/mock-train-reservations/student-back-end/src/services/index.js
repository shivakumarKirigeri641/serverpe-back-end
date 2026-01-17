/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - SERVICES INDEX
 * ==============================================
 * Central export for all service modules.
 */

const trainService = require("./trainService");
const authService = require("./authService");

module.exports = {
  trainService,
  authService,
};
