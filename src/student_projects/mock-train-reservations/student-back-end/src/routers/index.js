/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - ROUTERS INDEX
 * ==============================================
 * Central export for all router modules.
 */

const studentTrainRouter = require("./studentTrainRouter");
const authRouter = require("./authRouter");
const healthRouter = require("./healthRouter");

module.exports = {
  studentTrainRouter,
  authRouter,
  healthRouter,
};
