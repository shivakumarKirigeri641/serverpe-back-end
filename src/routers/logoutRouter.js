const express = require("express");
const jwt = require("jsonwebtoken");
const logoutRouter = express.Router();
const deleteTokenSessionOnMobile = require("../SQL/deleteTokenSessionOnMobile");
const getPostgreClient = require("../SQL/getPostgreClient");
const getTokenDetails = require("../SQL/getTokenDetails");
const { connectDB } = require("../database/connectDB");
logoutRouter.post("/unreserved-ticket/user/logout", async (req, res) => {
  let client = null;
  try {
    const { token } = req.cookies;
    if (!token) {
      throw {
        success: false,
        message: "No Session found! Please re-login",
        data: {},
      };
    }
    const result = await jwt.verify(token, process.env.SECRET_KEY);
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    const result_from_db = await getTokenDetails(client, token);
    if (0 === result_from_db.rows.length) {
      throw {
        success: false,
        message: "Invalid session!",
        data: {},
      };
    }
    if (
      result_from_db.rows[0].generated_token.toString() === token.toString()
    ) {
      //delete token details
      await deleteTokenSessionOnMobile(client, result.mobile_number);
    } else {
      throw {
        success: false,
        message: "Invalid session found!",
        data: {},
      };
    }
    res.cookie("token", null, { maxAge: 0 });
    res.status(200).json({
      success: true,
      message: "You have successfully logged-out!",
      data: {},
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    res.status(400).json(err);
  } finally {
    if (client) {
      await client.release();
    }
  }
});

module.exports = logoutRouter;
