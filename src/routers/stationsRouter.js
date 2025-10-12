const express = require("express");
const getAllStations = require("../SQL/getAllStations");
const stationsRouter = express.Router();
const checkApiKey = require("../middleware/checkApiKey");
const { connectDB } = require("../database/connectDB");
const getPostgreClient = require("../SQL/getPostgreClient");
module.exports = stationsRouter;
