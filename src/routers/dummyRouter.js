const express = require("express");
const jwt = require("jsonwebtoken");
const dummyRouter = express.Router();
const insertSeats = require("../utils/insertSeats");
const deleteTokenSessionOnMobile = require("../SQL/deleteTokenSessionOnMobile");
const getPostgreClient = require("../SQL/getPostgreClient");
const getTokenDetails = require("../SQL/getTokenDetails");
const { connectDB } = require("../database/connectDB");
const getSeatStringA1 = require("../utils/getSeatStringA1");
const getSeatStringA2 = require("../utils/getSeatStringA2");
const getSeatStringA3 = require("../utils/getSeatStringA3");
const getSeatStringCC = require("../utils/getSeatStringCC");
const getSeatStringEC = require("../utils/getSeatStringEC");
const getSeatStringSL = require("../utils/getSeatStringSL");
const getSeatStringEA = require("../utils/getSeatStringEC");
const getSeatStringE3 = require("../utils/getSeatStringEC");
const getSeatStringFC = require("../utils/getSeatStringEC");
const insertSeats = require("../utils/insertSeats");
const insertSeatString = require("../utils/insertStrings");
dummyRouter.post("/test-booking", async (req, res) => {
  let client = null;
  let result = "";
  try {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    //first insert train_nubmers
    //await insertSeats(client);
    //insert seats
    //await insertSeatString(client);
    res.json({ length: 4 });
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
