const express = require("express");
const getReservationType = require("../SQL/fetchers/getReservationType");
const getCoachType = require("../SQL/fetchers/getCoachType");
const { connectDB } = require("../database/connectDB");
const dummyRouter = express.Router();
const getPostgreClient = require("../SQL/getPostgreClient");
const getTrainSchedule = require("../SQL/fetchers/getTrainSchedule");
const getBerth_sl = require("../utils/getBerth_sl");
const confirmBooking = require("../SQL/confirmBooking");
const proceedBooking = require("../SQL/proceedBooking");
const searchTrains = require("../SQL/fetchers/searchTrains");
//reservation_type
dummyRouter.get("/reservation-type", async (req, res) => {
  const pool = await connectDB();
  client = await getPostgreClient(pool);
  try {
    //validation later
    const result = await getReservationType(client);
    res.status(200).json({
      status: 200,
      success: true,
      message: "Reservation type fetch successfull",
      data: result.rows,
    });
  } catch (err) {
    res
      .status(err.status)
      .json({ status: err.status, success: false, data: err.message });
  }
});
//coach_type
dummyRouter.get("/coach-type", async (req, res) => {
  const pool = await connectDB();
  client = await getPostgreClient(pool);
  try {
    //validation later
    const result = await getCoachType(client);
    res.status(200).json({
      status: 200,
      success: true,
      message: "Coach type fetch successfull",
      data: result.rows,
    });
  } catch (err) {
    res
      .status(err.status)
      .json({ status: err.status, success: false, data: err.message });
  }
});
//schedule
dummyRouter.post("/train-schedule", async (req, res) => {
  const pool = await connectDB();
  client = await getPostgreClient(pool);

  try {
    //validation later
    let { train_number } = req.body;
    const train_schedule_details = await getTrainSchedule(
      client,
      train_number,
      "YPR",
      "KLBG"
    );
    res.status(200).json({
      status: 200,
      success: true,
      message: "Train schedule fetched successfully!",
      data: train_schedule_details,
    });
  } catch (err) {
    res.json({ status: err.status, success: false, data: err.message });
  }
});
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
    if (search_train_details.trains_list.length === 0) {
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
        data: search_train_details,
      });
    }
  } catch (err) {
    res.json({ status: err.status, success: false, data: err.message });
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
    res.json({ status: err.status, success: false, data: err.message });
  }
});
//confirm-ticket
dummyRouter.post("/confirm-booking", async (req, res) => {
  const pool = await connectDB();
  client = await getPostgreClient(pool);
  try {
    const ticket_details = await confirmBooking(client, req.body.booking_id);
    res.status(200).json({ status: 200, success: true, data: ticket_details });
  } catch (err) {
    res.json({ success: false, data: err.message });
  }
});

//test
dummyRouter.post("/test", async (req, res) => {
  try {
    const train_number = "11312";
  } catch (err) {
    res.send(err.message);
  }
  res.send("test");
});
module.exports = dummyRouter;
