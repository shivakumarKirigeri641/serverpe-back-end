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
const cancel_ticket = require("../SQL/reservations/cancel_ticket");
const runReservationSimulator = require("../SQL/insertion/runReservationSimulator");
const runSimulator_1a = require("../SQL/insertion/booking_simulator/runSimulator_1a");
const runSimulator_2a = require("../SQL/insertion/booking_simulator/runSimulator_2a");
const runSimulator_3a = require("../SQL/insertion/booking_simulator/runSimulator_3a");
const runSimulator_sl = require("../SQL/insertion/booking_simulator/runSimulator_sl");
const runSimulator_2s = require("../SQL/insertion/booking_simulator/runSimulator_2s");
const runSimulator_cc = require("../SQL/insertion/booking_simulator/runSimulator_cc");
const runSimulator_ec = require("../SQL/insertion/booking_simulator/runSimulator_ec");
const runSimulator_e3 = require("../SQL/insertion/booking_simulator/runSimulator_e3");
const runSimulator_ea = require("../SQL/insertion/booking_simulator/runSimulator_ea");
const runSimulator_fc = require("../SQL/insertion/booking_simulator/runSimulator_fc");
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
    if (!source_code) {
      throw {
        status: 200,
        success: false,
        message: `Source not found!`,
        data: {},
      };
    }
    if (!destination_code) {
      throw {
        status: 200,
        success: false,
        message: `Destination not found!`,
        data: {},
      };
    }
    if (!doj) {
      throw {
        status: 200,
        success: false,
        message: `Date of journey not found!`,
        data: {},
      };
    }
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
    res
      .status(err.status)
      .json({ status: err.status, success: false, message: err.message });
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
//cancel-ticket
dummyRouter.post("/cancel-ticket", async (req, res) => {
  const pool = await connectDB();
  client = await getPostgreClient(pool);
  try {
    const { pnr, passengerids } = req.body;
    if (!pnr) {
      throw {
        status: 200,
        success: false,
        message: `PNR not found!`,
        data: {},
      };
    }
    if (!passengerids) {
      throw {
        status: 200,
        success: false,
        message: `Passenger information not found!`,
        data: {},
      };
    }
    const result = await cancel_ticket(client, pnr, passengerids);
    res.status(200).json({ success: false, data: result });
  } catch (err) {
    res.json({ success: false, data: err.message });
  }
});
//pnr-status
dummyRouter.post("/cancel-ticket", async (req, res) => {
  const pool = await connectDB();
  client = await getPostgreClient(pool);
  try {
    const { pnr } = req.body;
    if (!pnr) {
      throw {
        status: 200,
        success: false,
        message: `PNR not found!`,
        data: {},
      };
    }
    const result = await getPnrStatus(client, pnr);
    res.status(200).json({ success: false, data: result });
  } catch (err) {
    res.json({ success: false, data: err.message });
  }
});
//test
dummyRouter.post("/test", async (req, res) => {
  const pool = await connectDB();
  client = await getPostgreClient(pool);
  try {
    //await runReservationSimulator(client);
    let i = 0;
    for (;;) {
      await runSimulator_sl(pool, client);
      console.log("booking count:", i);
      i++;
    }
    res.send("reservation simulator running");
  } catch (err) {
    res.send(err.message);
  }
});
module.exports = dummyRouter;
