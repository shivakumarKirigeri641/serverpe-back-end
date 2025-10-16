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
    if (search_train_details.rows.length === 0) {
      res.status(200).json({
        status: 200,
        success: true,
        message: "No trains found!",
        data: {},
      });
    } else {
      res.status(200).json({
        status: 200,
        success: true,
        message: "Trains fetch successfull",
        data: search_train_details.rows,
      });
    }
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
  let booking_summary = null;
  try {
    //validation later
    booking_summary = await proceedBooking(client, req.body);
    res.status(200).json({ status: 200, success: true, data: booking_summary });
  } catch (err) {
    res
      .status(401)
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
