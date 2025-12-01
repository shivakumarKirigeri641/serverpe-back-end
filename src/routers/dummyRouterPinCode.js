const express = require("express");
const getPinCodes = require("../SQL/PINCODES/getAllPinCodes");
const getPostgreClient = require("../SQL/getPostgreClient");
const { connectPinCodeDB } = require("../database/connectDB");
const dummRouterPinCode = express.Router();
dummRouterPinCode.get("/pincodes", async (req, res) => {
  const pool = await connectPinCodeDB();
  const client = await getPostgreClient(pool);
  const result = await getPinCodes(client);
  res.json(result);
});
module.exports = dummRouterPinCode;
