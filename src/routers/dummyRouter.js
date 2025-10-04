const express = require("express");
const jwt = require("jsonwebtoken");
const dummyRouter = express.Router();
const insertSeats = require("../utils/insertSeats");
const deleteTokenSessionOnMobile = require("../SQL/deleteTokenSessionOnMobile");
const getPostgreClient = require("../SQL/getPostgreClient");
const getTokenDetails = require("../SQL/getTokenDetails");
const { connectDB } = require("../database/connectDB");
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
