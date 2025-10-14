const express = require("express");
const { connectDB } = require("../database/connectDB");
const dummyRouter = express.Router();
const getPostgreClient = require("../SQL/getPostgreClient");
const getBerth_sl = require("../utils/getBerth_sl");
const proceedBooking = require("../SQL/proceedBooking");
const searchTrains = require("../SQL/fetchers/searchTrains");
//search trains
dummyRouter.post("/search-trains", async (req, res) => {
  const pool = await connectDB();
  client = await getPostgreClient(pool);

  try {
    //validation later
    let { source_code, destination_code, doj } = req.body;
    const search_train_details = await searchTrains(
      client,
      source_code.toUpperCase(),
      destination_code.toUpperCase(),
      doj
    );
    res
      .status(200)
      .json({ status: 200, success: true, data: search_train_details });
  } catch (err) {
    res
      .status(err.status)
      .json({ status: err.status, success: false, data: err.message });
  }
});
//prceed-booking
dummyRouter.post("/proceed-booking", async (req, res) => {
  const pool = await connectDB();
  client = await getPostgreClient(pool);

  try {
    //validation later
    const search_train_details = await proceedBooking(client, req.body);
    res
      .status(200)
      .json({ status: 200, success: true, data: search_train_details });
  } catch (err) {
    res
      .status(err.status)
      .json({ status: err.status, success: false, data: err.message });
  }
});
//confirm-ticket
dummyRouter.post("/confirm-ticket", async (req, res) => {
  const pool = await connectDB();
  client = await getPostgreClient(pool);
  res.send("test");
});
module.exports = dummyRouter;
