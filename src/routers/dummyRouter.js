const express = require("express");
const jwt = require("jsonwebtoken");
const dummyRouter = express.Router();
const insertSeats = require("../utils/insertSeats");
const deleteTokenSessionOnMobile = require("../SQL/deleteTokenSessionOnMobile");
const getPostgreClient = require("../SQL/getPostgreClient");
const getTokenDetails = require("../SQL/getTokenDetails");
const getBillSummary = require("../utils/getBillSummary");
const getReservedTrains = require("../SQL/getReservedTrains");
const { connectDB } = require("../database/connectDB");
const insertSeatString = require("../utils/insertStrings");
const simulatBookTickets = require("../utils/simulatBookTickets");
const getSeatTypeSL = require("../utils/getSeatTypeSL");
const populateSeatsSL = require("../utils/populateSeatsSL");
const insertBookingData = require("../SQL/insertBookingData");
const insertBookingChargesData = require("../SQL/insertBookingChargesData");
const insertPassengerData = require("../SQL/insertPassengerData");
dummyRouter.post("/test-booking/search-trains", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const { src, dest, doj } = req.body;
    const result_traindetails = await getReservedTrains(client, src, dest, doj);
    //await insertSeats(client);
    //await insertSeatString(client);
    res.json({ result: result_traindetails.rows });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.log(err.message);
    res.status(400).json(err);
  } finally {
    if (client) {
      await client.release();
    }
  }
});
dummyRouter.post("/test-booking/proceed-booking", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    let {
      train_number,
      src,
      boarding_at,
      dest,
      doj,
      reservation_type,
      coach_type,
      passenger_details,
    } = req.body;
    //first insertinto booking data
    let adultcount = passenger_details?.filter(
      (x) => x.passenger_ischild === false
    ).length;
    let childcount = passenger_details?.filter(
      (x) => x.passenger_ischild === true || x.passenger_age <= 6
    ).length;
    console.log("childcount:", childcount);
    let seniorcount = passenger_details?.filter(
      (x) => x.passenger_issenior === true || x.passenger_age >= 60
    ).length;
    let phcount = passenger_details?.filter(
      (x) => x.passenger_isphysicallyhandicapped === true
    ).length;
    const result_bookingdata = await insertBookingData(
      client,
      train_number,
      src.toUpperCase(),
      dest.toUpperCase(),
      boarding_at.toUpperCase(),
      doj,
      adultcount,
      childcount
    );
    //insert into bookingcharges
    const result_bookingChargesdata = await insertBookingChargesData(
      client,
      result_bookingdata.rows[0].id,
      train_number,
      src.toUpperCase(),
      dest.toUpperCase(),
      reservation_type,
      coach_type,
      passenger_details
    );
    //insertinto passenger data
    const result_passengerdetails = await insertPassengerData(
      client,
      result_bookingdata.rows[0].id,
      passenger_details
    );
    //send back
    let charges_summary = getBillSummary(
      result_bookingChargesdata,
      adultcount,
      childcount,
      seniorcount,
      phcount
    );
    res.json({
      success: true,
      bookingdetails: result_bookingdata.rows[0],
      passenger_details: result_passengerdetails.rows[0],
      bill: charges_summary,
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.log(err.message);
    res.status(400).json(err);
  } finally {
    if (client) {
      await client.release();
    }
  }
});

module.exports = dummyRouter;
