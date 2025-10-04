const express = require("express");
const jwt = require("jsonwebtoken");
const dummyRouter = express.Router();
const insertSeats = require("../utils/insertSeats");
const deleteTokenSessionOnMobile = require("../SQL/deleteTokenSessionOnMobile");
const getPostgreClient = require("../SQL/getPostgreClient");
const getTokenDetails = require("../SQL/getTokenDetails");
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
      (x) => x.passenger_ischild === true
    ).length;
    let seniorcount = passenger_details?.filter(
      (x) => x.passenger_issenior === true
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
    console.log(
      result_bookingdata.rows.length,
      result_bookingChargesdata.rows.length,
      result_passengerdetails.rows.length
    );
    let charges_summary = {
      total_base_fare:
        result_bookingChargesdata.rows[0].base_fare_per_adult * adultcount,
      total_child_concession:
        result_bookingChargesdata.rows[0].base_fare_per_adult * childcount -
        (result_bookingChargesdata.rows[0].base_fare_per_adult *
          childcount *
          result_bookingChargesdata.rows[0].percent_concession_child) /
          100,
      total_senior_concession:
        result_bookingChargesdata.rows[0].base_fare_per_adult * seniorcount -
        (result_bookingChargesdata.rows[0].base_fare_per_adult *
          seniorcount *
          result_bookingChargesdata.rows[0].percent_concession_senior) /
          100,
      total_physicallyhandicapped_concession:
        result_bookingChargesdata.rows[0].base_fare_per_adult * phcount -
        (result_bookingChargesdata.rows[0].base_fare_per_adult *
          phcount *
          result_bookingChargesdata.rows[0].percent_concession_senior) /
          100,
      GST_percent: result_bookingChargesdata.rows[0].GST,
      convience_percent: result_bookingChargesdata.rows[0].convience_percent,
      payment_integration_percent:
        result_bookingChargesdata.rows[0].payment_integration_percent,
      card_percent: result_bookingChargesdata.rows[0].card_percent,
      upi_percent: result_bookingChargesdata.rows[0].upi_percent,
      wallet_percent: result_bookingChargesdata.rows[0].wallet_percent,
    };
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
