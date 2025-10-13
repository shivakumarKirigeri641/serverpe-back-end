const express = require("express");
const { connectDB } = require("../database/connectDB");
const dummyRouter = express.Router();
const getPostgreClient = require("../SQL/getPostgreClient");
dummyRouter.post("/test", async (req, res) => {
  res.send("test");
});
module.exports = dummyRouter;
