const express = require("express");
const getTotalSeats = require("../utils/getTotalSeats");
const getBerth = require("../utils/getBerth");
const dummyRouter = express.Router();
const getPostgreClient = require("../SQL/getPostgreClient");
const getBillSummary = require("../utils/getBillSummary");
const getReservedTrains = require("../SQL/getReservedTrains");
const { connectDB } = require("../database/connectDB");
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
      childcount,
      reservation_type,
      coach_type
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
dummyRouter.post("/test-booking/confirm-booking", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const { bookingid, total_fare } = req.body;
    res.status(200).json(ticket_details);
  } finally {
    if (client) {
      await client.release();
    }
  }
});
dummyRouter.post("/test", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const daysToLoop = 60; // approx 2 months

    let currentDate = new Date();
    // Loop through next 60 days
    const coaches = ["1A", "2A", "3A", "CC", "EC", "E3", "EA", "FC", "SL"];
    //const coaches = ["1A"];

    for (let a = 0; a < coaches.length; a++) {
      const cccc = coaches[a];
      const result_trains = await client.query(
        `select *from coach_${coaches[a].toLowerCase()}`
      );
      for (let i = 0; i < result_trains.rows.length; i++) {
        console.log(
          "processing coach(" + coaches[a] + "): ",
          i + 1,
          "/",
          result_trains.rows.length
        );
        for (let j = 0; j < daysToLoop; j++) {
          const date = new Date(currentDate);
          date.setDate(currentDate.getDate() + j);
          const formatted = date.toISOString().split("T")[0];
          let seqno = 1;
          const toatlseats = getTotalSeats(cccc);
          for (let k = 0; k < result_trains.rows[i].bogi_count; k++) {
            for (let l = 1; l <= toatlseats; l++) {
              let { berth, coachDisplayName, totalSeats } = getBerth(
                coaches[a],
                seqno
              );
              await client.query(
                `insert into seats_${coaches[
                  a
                ].toLowerCase()} (train_number, date_of_journey, seat_sequence, coach_code, seat_no, berth, display_name ) values ($1,$2,$3,$4,$5,$6,$7)`,
                [
                  result_trains.rows[i].train_number,
                  formatted,
                  seqno,
                  k + 1,
                  l,
                  berth,
                  coachDisplayName,
                ]
              );
              seqno++;
            }
          }
        }
      }
    }

    res.status(200).json({ status: "ok" });
  } finally {
    if (client) {
      await client.release();
    }
  }
});
module.exports = dummyRouter;
