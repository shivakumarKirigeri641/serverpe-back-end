const express = require("express");
const verifyMobileNumber = require("../utils/verifyMobileNumber");
const verifyOtpFormat = require("../utils/verifyOtpFormat");
const getPostgreClient = require("../SQL/getPostgreClient");
const verifyEnteredOtp = require("../SQL/verifyEnteredOtp");
const getRandomOtp = require("../utils/getRandomOtp");
const sendOTPSMS = require("../utils/sendOTPSMS");
const sendOtpRouter = express.Router();
require("dotenv").config();
const insertOtpSessions = require("../SQL/insertOtpSessions");
const { connectDB } = require("../database/connectDB");
module.exports = {
  express,
  verifyMobileNumber,
  connectDB,
  getPostgreClient,
  verifyOtpFormat,
  verifyEnteredOtp,
  getRandomOtp,
  sendOtpRouter,
  insertOtpSessions,
  sendOTPSMS,
};
