const express = require("express");
const getAllStations = require("../SQL/getAllStations");
const trainsSearchRouter = express.Router();
const checkApiKey = require("../middleware/checkApiKey");
const { connectDB } = require("../database/connectDB");
const getPostgreClient = require("../SQL/getPostgreClient");
const getReservedTrains = require("../SQL/getReservedTrains");
trainsSearchRouter.get(
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
      if (0 < result.rows.length) {
        const jsondata = convertSearchTrainsToJson(
          src,
          dest,
          date_of_journey,
          result.rows
        );
        res.status(200).json({
          success: true,
          message: "No trains found!",
          data: jsondata,
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
module.exports = trainsSearchRouter;
