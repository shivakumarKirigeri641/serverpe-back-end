/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - REPOSITORIES INDEX
 * ==============================================
 * Central export for all repository modules.
 */

const trainRepository = require("./trainRepository");
const authRepository = require("./authRepository");

module.exports = {
  trainRepository,
  authRepository,
};
