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
    const { train_number, src, boarding_at, dest, doj, passenger_details } =
      req.body;

    res.json({ result: req.body });
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
