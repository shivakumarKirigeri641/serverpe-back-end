const express = require("express");
const getAllStations = require("../SQL/getAllStations");
const bookingticketRouter = express.Router();
const checkApiKey = require("../middleware/checkApiKey");
const { connectDB } = require("../database/connectDB");
const getPostgreClient = require("../SQL/getPostgreClient");
const getReservedTrains = require("../SQL/getReservedTrains");
//proceed-booking
bookingticketRouter.post(
  "/fakeapi/train/reserved-tickets/user/proceed-booking",
  //checkApiKey,
  async (req, res) => {
    let client = null;
    try {
      const {} = req.body;
      const pool = await connectDB();
      client = await getPostgreClient(pool);
      res.status(200).json({ data: "test" });
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
//select-confirmm-ticket
bookingticketRouter.post(
  "/fakeapi/train/reserved-tickets/user/select-confirmm-ticket",
  //checkApiKey,
  async (req, res) => {
    let client = null;
    try {
      const { bookingid } = req.body;
      const pool = await connectDB();
      client = await getPostgreClient(pool);

      res.status(200).json({ data: "test" });
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
module.exports = bookingticketRouter;
