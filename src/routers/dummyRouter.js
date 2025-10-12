const express = require("express");
const getBerthTypeEC = require("../utils/getSeatTypeEC");
const getTotalSeats = require("../utils/getTotalSeats");
const getBerth = require("../utils/getBerth");
const dummyRouter = express.Router();
const getPostgreClient = require("../SQL/getPostgreClient");
const getBillSummary = require("../utils/getBillSummary");
const getReservedTrains = require("../SQL/getReservedTrains");
const getIntegerRanomNumber = require("../utils/getIntegerRandomNumber");
const { connectDB } = require("../database/connectDB");
const insertBookingData = require("../SQL/insertBookingData");
const insertBookingChargesData = require("../SQL/insertBookingChargesData");
const insertPassengerData = require("../SQL/insertPassengerData");
const calculatefare = require("../SQL/calculatefare");
const bookTicket = require("../SQL/bookTicket");
const cancelTicket = require("../SQL/cancelTicket");
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
    const result_trains = await client.query(
      `select * from coaches where a_1 = $1 OR a_2 = $1 OR a_3 = $1 OR sl = $1 OR cc = $1 OR ec = $1 OR fc = $1 OR e_3 = $1 OR ea = $1 or _2s=$1 order by train_number`,
      ["Y"]
    );
    for (let i = 0; i < result_trains.rows.length; i++) {
      let seats_count_sl_gen = null;
      let seats_count_sl_rac = null;
      let seats_count_sl_ladies = null;
      let seats_count_sl_pwd = null;
      let seats_count_sl_senior = null;
      let seats_count_sl_duty = null;
      let seats_count_sl_ttl = null;
      let seats_count_sl_ptl = null;
      let seats_price_sl_gen = null;
      let seats_price_sl_ttl = null;
      let seats_price_sl_ptl = null;
      let total_seats_1a = null;
      let seats_count_1a_gen = null;
      let seats_price_1a_gen = null;
      let total_seats_2a = null;
      let seats_count_2a_gen = null;
      let seats_count_2a_rac = null;
      let seats_count_2a_ttl = null;
      let seats_count_2a_ptl = null;
      let seats_price_2a_gen = null;
      let seats_price_2a_ttl = null;
      let seats_price_2a_ptl = null;
      let total_seats_3a = null;
      let seats_count_3a_gen = null;
      let seats_count_3a_rac = null;
      let seats_count_3a_ladies = null;
      let seats_count_3a_pwd = null;
      let seats_count_3a_senior = null;
      let seats_count_3a_duty = null;
      let seats_count_3a_ttl = null;
      let seats_count_3a_ptl = null;
      let seats_price_3a_gen = null;
      let seats_price_3a_ttl = null;
      let seats_price_3a_ptl = null;
      let total_seats_cc = null;
      let seats_count_cc_gen = null;
      let seats_count_cc_ladies = null;
      let seats_count_cc_senior = null;
      let seats_count_cc_ttl = null;
      let seats_price_cc_gen = null;
      let seats_price_cc_ttl = null;
      let total_seats_2s = null;
      let seats_count_2s_gen = null;
      let seats_count_2s_ladies = null;
      let seats_count_2s_senior = null;
      let seats_count_2s_ttl = null;
      let seats_price_2s_gen = null;
      let seats_price_2s_ttl = null;
      let total_seats_ec = null;
      let seats_count_ec_gen = null;
      let seats_count_ec_ttl = null;
      let seats_count_ec_ptl = null;
      let seats_price_ec_gen = null;
      let seats_price_ec_ttl = null;
      let seats_price_ec_ptl = null;
      let total_seats_ea = null;
      let seats_count_ea_gen = null;
      let seats_count_ea_ttl = null;
      let seats_count_ea_ptl = null;
      let seats_price_ea_gen = null;
      let seats_price_ea_ttl = null;
      let seats_price_ea_ptl = null;
      let total_se3ts_e3 = null;
      let se3ts_count_e3_gen = null;
      let se3ts_count_e3_ladies = null;
      let se3ts_count_e3_senior = null;
      let se3ts_count_e3_ttl = null;
      let se3ts_count_e3_ptl = null;
      let se3ts_price_e3_gen = null;
      let se3ts_price_e3_ttl = null;
      let se3ts_price_e3_ptl = null;
      let total_sfcts_fc = null;
      let sfcts_count_fc_gen = null;
      let sfcts_price_fc_gen = null;

      //sl
      console.log("processing:" + i + "/" + result_trains.rows.length);
      let total_seats_sl = result_trains.rows[i].bogi_count_sl
        ? result_trains.rows[i].bogi_count_sl * 72
        : null;
      if (total_seats_sl) {
        seats_count_sl_gen = Math.floor((total_seats_sl * 60) / 100);
        seats_count_sl_rac = Math.floor((total_seats_sl * 10) / 100) * 2;
        seats_count_sl_ladies = Math.floor((total_seats_sl * 2) / 100);
        seats_count_sl_pwd = Math.floor((total_seats_sl * 2) / 100);
        seats_count_sl_senior = Math.floor((total_seats_sl * 2) / 100);
        seats_count_sl_duty = Math.floor((total_seats_sl * 2) / 100);
        seats_count_sl_ttl = Math.floor((total_seats_sl * 12) / 100);
        seats_count_sl_ptl = Math.floor((total_seats_sl * 10) / 100);
        seats_price_sl_gen = 1.12;
        seats_price_sl_ttl = 2.5;
        seats_price_sl_ptl = 5;
      }
      total_seats_1a = result_trains.rows[i].bogi_count_1a
        ? result_trains.rows[i].bogi_count_1a * 24
        : null;
      if (total_seats_1a) {
        seats_count_1a_gen = total_seats_1a;
        seats_price_1a_gen = 5.12;
      }
      total_seats_2a = result_trains.rows[i].bogi_count_2a
        ? result_trains.rows[i].bogi_count_2a * 46
        : null;
      if (total_seats_2a) {
        seats_count_2a_gen = Math.floor((total_seats_2a * 70) / 100);
        seats_count_2a_rac = Math.floor((total_seats_2a * 10) / 100) * 2;
        seats_count_2a_ttl = Math.floor((total_seats_2a * 10) / 100);
        seats_count_2a_ptl = Math.floor((total_seats_2a * 10) / 100);
        seats_price_2a_gen = 1.12;
        seats_price_2a_ttl = 2.5;
        seats_price_2a_ptl = 5;
      }
      total_seats_3a = result_trains.rows[i].bogi_count_3a
        ? result_trains.rows[i].bogi_count_3a * 64
        : null;
      if (total_seats_3a) {
        seats_count_3a_gen = Math.floor((total_seats_3a * 60) / 100);
        seats_count_3a_rac = Math.floor((total_seats_3a * 10) / 100) * 2;
        seats_count_3a_ladies = Math.floor((total_seats_3a * 2) / 100);
        seats_count_3a_pwd = Math.floor((total_seats_3a * 2) / 100);
        seats_count_3a_senior = Math.floor((total_seats_3a * 2) / 100);
        seats_count_3a_duty = Math.floor((total_seats_3a * 2) / 100);
        seats_count_3a_ttl = Math.floor((total_seats_3a * 12) / 100);
        seats_count_3a_ptl = Math.floor((total_seats_3a * 10) / 100);
        seats_price_3a_gen = 1.12;
        seats_price_3a_ttl = 2.5;
        seats_price_3a_ptl = 5;
      }
      total_seats_cc = result_trains.rows[i].bogi_count_cc
        ? result_trains.rows[i].bogi_count_cc * 78
        : null;
      if (total_seats_cc) {
        seats_count_cc_gen = Math.floor((total_seats_cc * 70) / 100);
        seats_count_cc_ladies = Math.floor((total_seats_cc * 10) / 100);
        seats_count_cc_senior = Math.floor((total_seats_cc * 10) / 100);
        seats_count_cc_ttl = Math.floor((total_seats_cc * 10) / 100);
        seats_price_cc_gen = 1.12;
        seats_price_cc_ttl = 2.5;
      }
      //2s
      total_seats_2s = result_trains.rows[i].bogi_count_2s
        ? result_trains.rows[i].bogi_count_2s * 103
        : null;
      if (total_seats_2s) {
        seats_count_2s_gen = Math.floor((total_seats_2s * 70) / 100);
        seats_count_2s_ladies = Math.floor((total_seats_2s * 10) / 100);
        seats_count_2s_senior = Math.floor((total_seats_2s * 10) / 100);
        seats_count_2s_ttl = Math.floor((total_seats_2s * 10) / 100);
        seats_price_2s_gen = 1.12;
        seats_price_2s_ttl = 2.5;
      }
      total_seats_ec = result_trains.rows[i].bogi_count_ec
        ? result_trains.rows[i].bogi_count_ec * 46
        : null;
      if (total_seats_ec) {
        seats_count_ec_gen = Math.floor((total_seats_ec * 80) / 100);
        seats_count_ec_ttl = Math.floor((total_seats_ec * 10) / 100);
        seats_count_ec_ptl = Math.floor((total_seats_ec * 10) / 100);
        seats_price_ec_gen = 1.12;
        seats_price_ec_ttl = 2.5;
        seats_price_ec_ptl = 5;
      }
      total_seats_ea = result_trains.rows[i].bogi_count_ea
        ? result_trains.rows[i].bogi_count_ea * 56
        : null;
      if (total_seats_ea) {
        seats_count_ea_gen = Math.floor((total_seats_ea * 60) / 100);
        seats_count_ea_ttl = Math.floor((total_seats_ea * 20) / 100);
        seats_count_ea_ptl = Math.floor((total_seats_ea * 20) / 100);
        seats_price_ea_gen = 1.12;
        seats_price_ea_ttl = 2.5;
        seats_price_ea_ptl = 5;
      }
      total_se3ts_e3 = result_trains.rows[i].bogi_count_e3
        ? result_trains.rows[i].bogi_count_e3 * 83
        : null;
      if (total_se3ts_e3) {
        se3ts_count_e3_gen = Math.floor((total_se3ts_e3 * 60) / 100);
        se3ts_count_e3_ladies = Math.floor((total_se3ts_e3 * 10) / 100);
        se3ts_count_e3_senior = Math.floor((total_se3ts_e3 * 10) / 100);
        se3ts_count_e3_ttl = Math.floor((total_se3ts_e3 * 10) / 100);
        se3ts_count_e3_ptl = Math.floor((total_se3ts_e3 * 10) / 100);
        se3ts_price_e3_gen = 1.12;
        se3ts_price_e3_ttl = 2.5;
        se3ts_price_e3_ptl = 5;
      }
      total_sfcts_fc = result_trains.rows[i].bogi_count_fc
        ? result_trains.rows[i].bogi_count_fc * 22
        : null;
      if (total_sfcts_fc) {
        sfcts_count_fc_gen = total_sfcts_fc;
        sfcts_price_fc_gen = 5.12;
      }
      if (
        !total_se3ts_e3 &&
        !total_seats_1a &&
        !total_seats_2a &&
        !total_seats_3a &&
        !total_seats_cc &&
        !total_seats_ea &&
        !total_seats_ec &&
        !total_seats_sl &&
        !total_sfcts_fc
      ) {
        continue;
      }
      const daysToLoop = 60; // approx 2 months
      let currentDate = new Date();
      for (let j = 0; j < daysToLoop; j++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + j);
        const formatted = date.toISOString().split("T")[0];
        await client.query(
          `insert into seatsondate (train_number, date_of_journey,
            seat_count_sl_gen,seat_count_sl_rac, seat_count_sl_ladies, seat_count_sl_pwd, seat_count_sl_seniors, seat_count_sl_duty,seat_count_sl_ttl,seat_count_sl_ptl,seat_price_sl_gen, seat_price_sl_ttl,seat_price_sl_ptl,
            seat_count_1a_gen,seat_price_1a_gen,
            seat_count_2a_gen,seat_count_2a_rac, seat_count_2a_ttl,seat_count_2a_ptl,seat_price_2a_gen, seat_price_2a_ttl,seat_price_2a_ptl,
            seat_count_3a_gen,seat_count_3a_rac, seat_count_3a_ladies, seat_count_3a_pwd, seat_count_3a_seniors, seat_count_3a_duty,seat_count_3a_ttl,seat_count_3a_ptl,seat_price_3a_gen, seat_price_3a_ttl,seat_price_3a_ptl,
            seat_count_cc_gen, seat_count_cc_ladies, seat_count_cc_seniors, seat_count_cc_ttl,seat_price_cc_gen, seat_price_cc_ttl,
            seat_count_2s_gen, seat_count_2s_ladies, seat_count_2s_seniors, seat_count_2s_ttl,seat_price_2s_gen, seat_price_2s_ttl,
            seat_count_ec_gen,seat_count_ec_ttl,seat_count_ec_ptl,seat_price_ec_gen, seat_price_ec_ttl,seat_price_ec_ptl,
            seat_count_ea_gen,seat_count_ea_ttl,seat_count_ea_ptl,seat_price_ea_gen, seat_price_ea_ttl,seat_price_ea_ptl,
            seat_count_e3_gen, seat_count_e3_ladies, seat_count_e3_seniors, seat_count_e3_ttl,seat_count_e3_ptl,seat_price_e3_gen, seat_price_e3_ttl,seat_price_e3_ptl,
            seat_count_fc_gen, seat_price_fc_gen
            ) values (
$1,
$2,
$3,
$4,
$5,
$6,
$7,
$8,
$9,
$10,
$11,
$12,
$13,
$14,
$15,
$16,
$17,
$18,
$19,
$20,
$21,
$22,
$23,
$24,
$25,
$26,
$27,
$28,
$29,
$30,
$31,
$32,
$33,
$34,
$35,
$36,
$37,
$38,
$39,
$40,
$41,
$42,
$43,
$44,
$45,
$46,
$47,
$48,
$49,
$50,
$51,
$52,
$53,
$54,
$55,
$56,
$57,
$58,
$59,
$60,
$61,

$62,
$63,
$64,
$65,
$66,
$67
)`,
          [
            result_trains.rows[i].train_number,
            formatted,
            seats_count_sl_gen,
            seats_count_sl_rac,
            seats_count_sl_ladies,
            seats_count_sl_pwd,
            seats_count_sl_senior,
            seats_count_sl_duty,
            seats_count_sl_ttl,
            seats_count_sl_ptl,
            seats_price_sl_gen,
            seats_price_sl_ttl,
            seats_price_sl_ptl,
            seats_count_1a_gen,
            seats_price_1a_gen,
            seats_count_2a_gen,
            seats_count_2a_rac,
            seats_count_2a_ttl,
            seats_count_2a_ptl,
            seats_price_2a_gen,
            seats_price_2a_ttl,
            seats_price_2a_ptl,
            seats_count_3a_gen,
            seats_count_3a_rac,
            seats_count_3a_ladies,
            seats_count_3a_pwd,
            seats_count_3a_senior,
            seats_count_3a_duty,
            seats_count_3a_ttl,
            seats_count_3a_ptl,
            seats_price_3a_gen,
            seats_price_3a_ttl,
            seats_price_3a_ptl,
            seats_count_cc_gen,
            seats_count_cc_ladies,
            seats_count_cc_senior,
            seats_count_cc_ttl,
            seats_price_cc_gen,
            seats_price_cc_ttl,
            seats_count_2s_gen,
            seats_count_2s_ladies,
            seats_count_2s_senior,
            seats_count_2s_ttl,
            seats_price_2s_gen,
            seats_price_2s_ttl,
            seats_count_ec_gen,
            seats_count_ec_ttl,
            seats_count_ec_ptl,
            seats_price_ec_gen,
            seats_price_ec_ttl,
            seats_price_ec_ptl,
            seats_count_ea_gen,
            seats_count_ea_ttl,
            seats_count_ea_ptl,
            seats_price_ea_gen,
            seats_price_ea_ttl,
            seats_price_ea_ptl,
            se3ts_count_e3_gen,
            se3ts_count_e3_ladies,
            se3ts_count_e3_senior,
            se3ts_count_e3_ttl,
            se3ts_count_e3_ptl,
            se3ts_price_e3_gen,
            se3ts_price_e3_ttl,
            se3ts_price_e3_ptl,
            sfcts_count_fc_gen,
            sfcts_price_fc_gen,
          ]
        );
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
//search-trains
dummyRouter.post(
  "/fakeapi/train/reserved-tickets/user/search-trains",
  //checkApiKey,
  async (req, res) => {
    let client = null;
    try {
      const { src, dest, date_of_journey } = req.body;
      const pool = await connectDB();
      client = await getPostgreClient(pool);
      const result = await getReservedTrains(
        client,
        src,
        dest,
        date_of_journey
      );
      //do the jsonobject converstion later
      if (0 < result.rows.length) {
        res.status(200).json({
          success: true,
          message: "No trains found!",
          data: result.rows,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "No trains found!",
          data: {},
        });
      }
    } catch (err) {
      if (client) {
        await client.query("ROLLBACK");
      }
      res.status(501).json({
        success: false,
        message: "Something went wrong!",
        data: { technical_message: err.message },
      });
    } finally {
      if (client) {
        await client.release();
      }
    }
  }
);
//proceed-booking
dummyRouter.post("/proceed-booking", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const {
      train_number,
      src,
      dest,
      doj,
      boarding_at,
      mobile_number,
      reservation_type,
      coach_type,
      passenger_details,
    } = req.body;
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const adults = passenger_details.filter(
      (x) => x.passenger_ischild == false
    );
    const children = passenger_details.filter(
      (x) => x.passenger_ischild == true
    );

    //booking details
    const result_bookingdata = await insertBookingData(
      client,
      train_number,
      src.toUpperCase(),
      dest.toUpperCase(),
      boarding_at.toUpperCase(),
      doj,
      adults.length,
      children.length,
      reservation_type.toUpperCase(),
      coach_type.toUpperCase(),
      mobile_number,
      passenger_details
    );
    //passenger details
    const result_passengerdata = await insertPassengerData(
      client,
      result_bookingdata.rows[0].id,
      passenger_details
    );
    //calculate-fare details
    const fare_details = await calculatefare(
      client,
      result_bookingdata.rows[0],
      result_passengerdata.rows,
      adults.length,
      children.length
    );
    res.status(200).json({
      sucess: true,
      status: "ok",
      bookingdetails: result_bookingdata.rows[0],
      passenger_details: result_passengerdata.rows,
      fare_details: fare_details,
    });
  } catch (err) {
    console.log(err);
  } finally {
    if (client) {
      await client.release();
    }
  }
});
//confirm-ticket
dummyRouter.post("/confirm-ticket", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const { bookingid } = req.body;
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const booking_details = await bookTicket(client, bookingid);
    res.status(200).json({
      success: true,
      booking_details,
    });
  } catch (err) {
    if (!err.success) {
      res.status(200).json({
        success: false,
        message: err.message,
        data: err.data,
      });
    } else {
      res.status(501).json({
        success: false,
        message: err.message,
        data: err.data,
      });
    }
  } finally {
    if (client) {
      await client.release();
    }
  }
});

//cancel-ticket
dummyRouter.post("/cancel-ticket", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const { pnr, passengerids } = req.body;
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const booking_details = await cancelTicket(client, pnr, passengerids);
    res.status(200).json({
      success: true,
      booking_details,
    });
  } catch (err) {
    if (200 === err.status) {
      res.status(200).json({
        success: false,
        message: err.message,
        data: err.data,
      });
    } else {
      res.status(501).json({
        success: false,
        message: err.message,
        data: err.data,
      });
    }
  } finally {
    if (client) {
      await client.release();
    }
  }
});
module.exports = dummyRouter;
