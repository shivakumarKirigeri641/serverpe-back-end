const express = require("express");
const getBerthTypeEC = require("../utils/getSeatTypeEC");
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
//sl
dummyRouter.post("/testsl", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const daysToLoop = 60; // approx 2 months

    let currentDate = new Date();
    // Loop through next 60 days
    //const coaches = ["1A", "2A", "3A", "CC", "EC", "E3", "EA", "FC", "SL"];
    const coaches = ["SL"];
    for (let a = 0; a < coaches.length; a++) {
      const cccc = coaches[a];
      const result_trains = await client.query(
        `select * from coaches where ${coaches[a].toLowerCase()} = $1`,
        ["Y"]
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
          let bogi_count = 10;
          let arrayofseats_gen = [];
          let arrayofseats_seniors = [];
          let arrayofseats_rac = [];
          let arrayofseats_ladies = [];
          let arrayofseats_pwd = [];
          let arrayofseats_ttl = [];
          let arrayofseats_duty = [];
          let arrayofseats_ptl = [];
          for (let k = 0; k < 10; k++) {
            let seat_no = (k + 1) * 10;
            //duty
            for (let l = 1; l <= 72; l++) {
              if (l == 7 || l == 8) {
                arrayofseats_duty.push(seat_no);
              } else {
                arrayofseats_duty.push(seat_no + 2);
              }
            }
            //senior
            for (let l = 1; l <= 72; l++) {
              if (l == 1 || l == 4) {
                arrayofseats_seniors.push(seat_no);
              } else {
                arrayofseats_seniors.push(seat_no + 2);
              }
            }
            //gen
            for (let l = 1; l <= 72; l++) {
              let seat_no = (k + 1) * 10;
              if (
                l == 2 ||
                l == 3 ||
                (l >= 5 && l <= 35) ||
                (l >= 37 && l <= 40)
              ) {
                arrayofseats_gen.push(seat_no);
              } else {
                arrayofseats_gen.push(seat_no + 2);
              }
            }
            //rac
            for (let l = 1; l <= 72; l++) {
              if (l >= 43 && l <= 52) {
                arrayofseats_rac.push(seat_no);
              } else {
                arrayofseats_rac.push(seat_no + 2);
              }
            }
            //ladies
            for (let l = 1; l <= 72; l++) {
              if (l == 36 || l == 42) {
                arrayofseats_ladies.push(seat_no);
              } else {
                arrayofseats_ladies.push(seat_no + 2);
              }
            }
            //ttl
            for (let l = 1; l <= 72; l++) {
              if (l >= 53 && l <= 62) {
                arrayofseats_ttl.push(seat_no);
              } else {
                arrayofseats_ttl.push(seat_no + 2);
              }
            }
            //ptl
            for (let l = 1; l <= 72; l++) {
              if (l == 67 || (l >= 63 && l <= 65) || (l >= 69 && l <= 72)) {
                arrayofseats_ptl.push(seat_no);
              } else {
                arrayofseats_ptl.push(seat_no + 2);
              }
            }
            //pwd
            for (let l = 1; l <= 72; l++) {
              if (l == 65 || l == 68) {
                arrayofseats_pwd.push(seat_no);
              } else {
                arrayofseats_pwd.push(seat_no + 2);
              }
            }
          }
          await client.query(
            `insert into seats_sl (train_number, date_of_journey, seat_allocations_gen, seat_allocations_rac, seat_allocations_ttl, 
            seat_allocations_ptl, seat_allocations_ladies, seat_allocations_pwd, seat_allocations_duty,seat_allocations_senior) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              result_trains.rows[i].train_number,
              formatted,
              arrayofseats_gen,
              arrayofseats_rac,
              arrayofseats_ttl,
              arrayofseats_ptl,
              arrayofseats_ladies,
              arrayofseats_pwd,
              arrayofseats_duty,
              arrayofseats_seniors,
            ]
          );
        }
      }
    }

    res.status(200).json({
      status: "ok",
    });
  } finally {
    if (client) {
      await client.release();
    }
  }
});
dummyRouter.post("/test3a", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const daysToLoop = 60; // approx 2 months

    let currentDate = new Date();
    // Loop through next 60 days
    //const coaches = ["1A", "2A", "3A", "CC", "EC", "E3", "EA", "FC", "SL"];
    const coaches = ["3A"];
    for (let a = 0; a < coaches.length; a++) {
      const cccc = coaches[a];
      const result_trains = await client.query(
        `select * from coaches where a_3 = $1`,
        ["Y"]
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
          let bogi_count = 10;
          let arrayofseats_gen = [];
          let arrayofseats_seniors = [];
          let arrayofseats_rac = [];
          let arrayofseats_ladies = [];
          let arrayofseats_pwd = [];
          let arrayofseats_ttl = [];
          let arrayofseats_duty = [];
          let arrayofseats_ptl = [];
          for (let k = 0; k < 4; k++) {
            let seat_no = (k + 1) * 10;
            //duty
            for (let l = 1; l <= 64; l++) {
              if (l == 7 || l == 8) {
                arrayofseats_duty.push(seat_no);
              } else {
                arrayofseats_duty.push(seat_no + 2);
              }
            }
            //senior
            for (let l = 1; l <= 64; l++) {
              if (l == 1 || l == 4) {
                arrayofseats_seniors.push(seat_no);
              } else {
                arrayofseats_seniors.push(seat_no + 2);
              }
            }
            //gen
            for (let l = 1; l <= 64; l++) {
              let seat_no = (k + 1) * 10;
              if (
                l == 2 ||
                l == 3 ||
                (l >= 5 && l <= 35) ||
                (l >= 37 && l <= 38)
              ) {
                arrayofseats_gen.push(seat_no);
              } else {
                arrayofseats_gen.push(seat_no + 2);
              }
            }
            //rac
            for (let l = 1; l <= 64; l++) {
              if (l == 39 || l == 40 || (l >= 42 && l <= 47)) {
                arrayofseats_rac.push(seat_no);
              } else {
                arrayofseats_rac.push(seat_no + 2);
              }
            }
            //ladies
            for (let l = 1; l <= 64; l++) {
              if (l == 36 || l == 41) {
                arrayofseats_ladies.push(seat_no);
              } else {
                arrayofseats_ladies.push(seat_no + 2);
              }
            }
            //ttl
            for (let l = 1; l <= 64; l++) {
              if (l >= 48 && l <= 55) {
                arrayofseats_ttl.push(seat_no);
              } else {
                arrayofseats_ttl.push(seat_no + 2);
              }
            }
            //ptl
            for (let l = 1; l <= 64; l++) {
              if (l == 56 || (l >= 58 && l <= 61) || (l >= 63 && l <= 64)) {
                arrayofseats_ptl.push(seat_no);
              } else {
                arrayofseats_ptl.push(seat_no + 2);
              }
            }
            //pwd
            for (let l = 1; l <= 64; l++) {
              if (l == 57 || l == 60) {
                arrayofseats_pwd.push(seat_no);
              } else {
                arrayofseats_pwd.push(seat_no + 2);
              }
            }
          }
          await client.query(
            `insert into seats_3a (train_number, date_of_journey, seat_allocations_gen, seat_allocations_rac, seat_allocations_ttl, 
            seat_allocations_ptl, seat_allocations_ladies, seat_allocations_pwd, seat_allocations_duty,seat_allocations_senior) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              result_trains.rows[i].train_number,
              formatted,
              arrayofseats_gen,
              arrayofseats_rac,
              arrayofseats_ttl,
              arrayofseats_ptl,
              arrayofseats_ladies,
              arrayofseats_pwd,
              arrayofseats_duty,
              arrayofseats_seniors,
            ]
          );
        }
      }
    }

    res.status(200).json({
      status: "ok",
    });
  } finally {
    if (client) {
      await client.release();
    }
  }
});
dummyRouter.post("/test2a", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const daysToLoop = 60; // approx 2 months

    let currentDate = new Date();
    // Loop through next 60 days
    //const coaches = ["1A", "2A", "3A", "CC", "EC", "E3", "EA", "FC", "SL"];
    const coaches = ["2A"];
    for (let a = 0; a < coaches.length; a++) {
      const cccc = coaches[a];
      const result_trains = await client.query(
        `select * from coaches where a_2 = $1`,
        ["Y"]
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
          let bogi_count = 10;
          let arrayofseats_gen = [];
          let arrayofseats_seniors = [];
          let arrayofseats_rac = [];
          let arrayofseats_ladies = [];
          let arrayofseats_pwd = [];
          let arrayofseats_ttl = [];
          let arrayofseats_duty = [];
          let arrayofseats_ptl = [];
          for (let k = 0; k < 3; k++) {
            let seat_no = (k + 1) * 10;
            //gen
            for (let l = 1; l <= 46; l++) {
              let seat_no = (k + 1) * 10;
              if (l >= 1 && l <= 27) {
                arrayofseats_gen.push(seat_no);
              } else {
                arrayofseats_gen.push(seat_no + 2);
              }
            }
            //rac
            for (let l = 1; l <= 46; l++) {
              if (l >= 28 && l <= 34) {
                arrayofseats_rac.push(seat_no);
              } else {
                arrayofseats_rac.push(seat_no + 2);
              }
            }
            //ttl
            for (let l = 1; l <= 46; l++) {
              if (l >= 35 && l <= 40) {
                arrayofseats_ttl.push(seat_no);
              } else {
                arrayofseats_ttl.push(seat_no + 2);
              }
            }
            //ptl
            for (let l = 1; l <= 46; l++) {
              if (l >= 41 && l <= 46) {
                arrayofseats_ptl.push(seat_no);
              } else {
                arrayofseats_ptl.push(seat_no + 2);
              }
            }
          }
          await client.query(
            `insert into seats_2a (train_number, date_of_journey, seat_allocations_gen, seat_allocations_rac, seat_allocations_ttl, 
            seat_allocations_ptl) values ($1,$2,$3,$4,$5,$6)`,
            [
              result_trains.rows[i].train_number,
              formatted,
              arrayofseats_gen,
              arrayofseats_rac,
              arrayofseats_ttl,
              arrayofseats_ptl,
            ]
          );
        }
      }
    }

    res.status(200).json({
      status: "ok",
    });
  } finally {
    if (client) {
      await client.release();
    }
  }
});
dummyRouter.post("/test1a", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const daysToLoop = 60; // approx 2 months

    let currentDate = new Date();
    // Loop through next 60 days
    //const coaches = ["1A", "2A", "3A", "CC", "EC", "E3", "EA", "FC", "SL"];
    const coaches = ["1A"];
    for (let a = 0; a < coaches.length; a++) {
      const cccc = coaches[a];
      const result_trains = await client.query(
        `select * from coaches where a_1 = $1`,
        ["Y"]
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
          let bogi_count = 10;
          let arrayofseats_gen = [];
          let arrayofseats_seniors = [];
          let arrayofseats_rac = [];
          let arrayofseats_ladies = [];
          let arrayofseats_pwd = [];
          let arrayofseats_ttl = [];
          let arrayofseats_duty = [];
          let arrayofseats_ptl = [];
          for (let k = 0; k < 2; k++) {
            let seat_no = (k + 1) * 10;
            //gen
            for (let l = 1; l <= 24; l++) {
              let seat_no = (k + 1) * 10;
              arrayofseats_gen.push(seat_no);
            }
          }
          await client.query(
            `insert into seats_1a (train_number, date_of_journey, seat_allocations_gen) values ($1,$2,$3)`,
            [result_trains.rows[i].train_number, formatted, arrayofseats_gen]
          );
        }
      }
    }

    res.status(200).json({
      status: "ok",
    });
  } finally {
    if (client) {
      await client.release();
    }
  }
});
dummyRouter.post("/testcc", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const daysToLoop = 60; // approx 2 months

    let currentDate = new Date();
    // Loop through next 60 days
    //const coaches = ["1A", "2A", "3A", "CC", "EC", "E3", "EA", "FC", "SL"];
    const coaches = ["CC"];
    for (let a = 0; a < coaches.length; a++) {
      const cccc = coaches[a];
      const result_trains = await client.query(
        `select * from coaches where cc = $1`,
        ["Y"]
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
          let bogi_count = 10;
          let arrayofseats_gen = [];
          let arrayofseats_seniors = [];
          let arrayofseats_rac = [];
          let arrayofseats_ladies = [];
          let arrayofseats_pwd = [];
          let arrayofseats_ttl = [];
          let arrayofseats_duty = [];
          let arrayofseats_ptl = [];
          for (let k = 0; k < 12; k++) {
            let seat_no = (k + 1) * 10;
            //senior
            for (let l = 1; l <= 78; l++) {
              if (l >= 45 && l <= 48) {
                arrayofseats_seniors.push(seat_no);
              } else {
                arrayofseats_seniors.push(seat_no + 2);
              }
            }
            //gen
            for (let l = 1; l <= 78; l++) {
              let seat_no = (k + 1) * 10;
              if (l >= 1 && l <= 40) {
                arrayofseats_gen.push(seat_no);
              } else {
                arrayofseats_gen.push(seat_no + 2);
              }
            }
            //ladies
            for (let l = 1; l <= 78; l++) {
              if (l >= 41 && l <= 44) {
                arrayofseats_ladies.push(seat_no);
              } else {
                arrayofseats_ladies.push(seat_no + 2);
              }
            }
            //ttl
            for (let l = 1; l <= 78; l++) {
              if (l >= 49 && l <= 78) {
                arrayofseats_ttl.push(seat_no);
              } else {
                arrayofseats_ttl.push(seat_no + 2);
              }
            }
          }
          await client.query(
            `insert into seats_cc (train_number, date_of_journey, seat_allocations_gen, seat_allocations_ttl, 
            seat_allocations_ladies, seat_allocations_senior) values ($1,$2,$3,$4,$5,$6)`,
            [
              result_trains.rows[i].train_number,
              formatted,
              arrayofseats_gen,
              arrayofseats_ttl,
              arrayofseats_ladies,
              arrayofseats_seniors,
            ]
          );
        }
      }
    }

    res.status(200).json({
      status: "ok",
    });
  } finally {
    if (client) {
      await client.release();
    }
  }
});
dummyRouter.post("/testec", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const daysToLoop = 60; // approx 2 months

    let currentDate = new Date();
    // Loop through next 60 days
    //const coaches = ["1A", "2A", "3A", "CC", "EC", "E3", "EA", "FC", "SL"];
    const coaches = ["EC"];
    for (let a = 0; a < coaches.length; a++) {
      const cccc = coaches[a];
      const result_trains = await client.query(
        `select * from coaches where ec = $1`,
        ["Y"]
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
          let bogi_count = 10;
          let arrayofseats_gen = [];
          let arrayofseats_seniors = [];
          let arrayofseats_rac = [];
          let arrayofseats_ladies = [];
          let arrayofseats_pwd = [];
          let arrayofseats_ttl = [];
          let arrayofseats_duty = [];
          let arrayofseats_ptl = [];
          for (let k = 0; k < 3; k++) {
            let seat_no = (k + 1) * 10;
            //gen
            for (let l = 1; l <= 44; l++) {
              let seat_no = (k + 1) * 10;
              if (l >= 1 && l <= 24) {
                arrayofseats_gen.push(seat_no);
              } else {
                arrayofseats_gen.push(seat_no + 2);
              }
            }
            //ttl
            for (let l = 1; l <= 44; l++) {
              if (l >= 25 && l <= 34) {
                arrayofseats_ttl.push(seat_no);
              } else {
                arrayofseats_ttl.push(seat_no + 2);
              }
            }
            //ptl
            for (let l = 1; l <= 44; l++) {
              if (l >= 35 && l <= 44) {
                arrayofseats_ptl.push(seat_no);
              } else {
                arrayofseats_ptl.push(seat_no + 2);
              }
            }
          }
          await client.query(
            `insert into seats_ec (train_number, date_of_journey, seat_allocations_gen, seat_allocations_ttl, 
            seat_allocations_ptl) values ($1,$2,$3,$4,$5)`,
            [
              result_trains.rows[i].train_number,
              formatted,
              arrayofseats_gen,
              arrayofseats_ttl,
              arrayofseats_ptl,
            ]
          );
        }
      }
    }

    res.status(200).json({
      status: "ok",
    });
  } finally {
    if (client) {
      await client.release();
    }
  }
});
dummyRouter.post("/teste3", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const daysToLoop = 60; // approx 2 months

    let currentDate = new Date();
    // Loop through next 60 days
    //const coaches = ["1A", "2A", "3A", "CC", "EC", "E3", "EA", "FC", "SL"];
    const coaches = ["E3"];
    for (let a = 0; a < coaches.length; a++) {
      const cccc = coaches[a];
      const result_trains = await client.query(
        `select * from coaches where e_3 = $1`,
        ["Y"]
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
          let bogi_count = 10;
          let arrayofseats_gen = [];
          let arrayofseats_seniors = [];
          let arrayofseats_rac = [];
          let arrayofseats_ladies = [];
          let arrayofseats_pwd = [];
          let arrayofseats_ttl = [];
          let arrayofseats_duty = [];
          let arrayofseats_ptl = [];
          for (let k = 0; k < 4; k++) {
            let seat_no = (k + 1) * 10;
            //senior
            for (let l = 1; l <= 83; l++) {
              if (l == 1 || l == 4) {
                arrayofseats_seniors.push(seat_no);
              } else {
                arrayofseats_seniors.push(seat_no + 2);
              }
            }
            //gen
            for (let l = 1; l <= 83; l++) {
              let seat_no = (k + 1) * 10;
              if (
                l == 2 ||
                l == 3 ||
                (l >= 5 && l <= 35) ||
                (l >= 37 && l <= 40) ||
                (l >= 42 && l <= 50)
              ) {
                arrayofseats_gen.push(seat_no);
              } else {
                arrayofseats_gen.push(seat_no + 2);
              }
            }
            //rac
            for (let l = 1; l <= 83; l++) {
              if (l >= 51 && l <= 60) {
                arrayofseats_rac.push(seat_no);
              } else {
                arrayofseats_rac.push(seat_no + 2);
              }
            }
            //ladies
            for (let l = 1; l <= 83; l++) {
              if (l == 36 || l == 41) {
                arrayofseats_ladies.push(seat_no);
              } else {
                arrayofseats_ladies.push(seat_no + 2);
              }
            }
            //ttl
            for (let l = 1; l <= 83; l++) {
              if (l >= 61 && l <= 70) {
                arrayofseats_ttl.push(seat_no);
              } else {
                arrayofseats_ttl.push(seat_no + 2);
              }
            }
            //pwd
            for (let l = 1; l <= 83; l++) {
              if (
                (l >= 71 && l <= 75) ||
                (l >= 77 && l <= 80) ||
                l == 82 ||
                l == 83
              ) {
                arrayofseats_pwd.push(seat_no);
              } else {
                arrayofseats_pwd.push(seat_no + 2);
              }
            }
          }
          await client.query(
            `insert into seats_e3 (train_number, date_of_journey, seat_allocations_gen, seat_allocations_rac, seat_allocations_ttl, 
            seat_allocations_ptl, seat_allocations_ladies, seat_allocations_pwd, seat_allocations_duty,seat_allocations_senior) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              result_trains.rows[i].train_number,
              formatted,
              arrayofseats_gen,
              arrayofseats_rac,
              arrayofseats_ttl,
              arrayofseats_ptl,
              arrayofseats_ladies,
              arrayofseats_pwd,
              arrayofseats_duty,
              arrayofseats_seniors,
            ]
          );
        }
      }
    }

    res.status(200).json({
      status: "ok",
    });
  } finally {
    if (client) {
      await client.release();
    }
  }
});
dummyRouter.post("/testfc", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const daysToLoop = 60; // approx 2 months

    let currentDate = new Date();
    // Loop through next 60 days
    //const coaches = ["1A", "2A", "3A", "CC", "EC", "E3", "EA", "FC", "SL"];
    const coaches = ["FC"];
    for (let a = 0; a < coaches.length; a++) {
      const cccc = coaches[a];
      const result_trains = await client.query(
        `select * from coaches where fc = $1`,
        ["Y"]
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
          let bogi_count = 10;
          let arrayofseats_gen = [];
          let arrayofseats_seniors = [];
          let arrayofseats_rac = [];
          let arrayofseats_ladies = [];
          let arrayofseats_pwd = [];
          let arrayofseats_ttl = [];
          let arrayofseats_duty = [];
          let arrayofseats_ptl = [];
          for (let k = 0; k < 2; k++) {
            let seat_no = (k + 1) * 10;
            //gen
            for (let l = 1; l <= 22; l++) {
              let seat_no = (k + 1) * 10;
              arrayofseats_gen.push(seat_no);
            }
          }
          await client.query(
            `insert into seats_fc (train_number, date_of_journey, seat_allocations_gen) values ($1,$2,$3)`,
            [result_trains.rows[i].train_number, formatted, arrayofseats_gen]
          );
        }
      }
    }

    res.status(200).json({
      status: "ok",
    });
  } finally {
    if (client) {
      await client.release();
    }
  }
});
module.exports = dummyRouter;
