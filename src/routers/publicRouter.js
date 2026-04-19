const express = require("express");
const publicRouter = express.Router();
const getQueryTypes = require("../repos/gets/getQueryTypes");
const {
  authLimiter,
  sensitiveOpLimiter,
} = require("../middlewares/rateLimiter");
const validateForContactUs = require("../validators/validateForContactUs");
const insertContactQuery = require("../repos/insertions/insertContactQuery");
// ======================================================
//                QUERY-TYPES
// ======================================================
publicRouter.get("/serverpe/platform/public/query-types", async (req, res) => {
  try {
    const result = await getQueryTypes();
    return res.status(result.statuscode).json({
      statuscode: result.statuscode,
      powered_by: "ServerPe App Solutions",
      successstatus: result.successstatus,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    return res.status(500).json({
      statuscode: 500,
      powered_by: "ServerPe App Solutions",
      successstatus: false,
      message: `Internal server error. Error:${err.message}`,
    });
  } finally {
  }
});
// ======================================================
//                CONTACT-US
// ======================================================
publicRouter.post(
  "/serverpe/platform/public/contact-us",
  sensitiveOpLimiter,
  async (req, res) => {
    try {
      let result = validateForContactUs(req);
      if (false === result.successstatus) {
        return res.status(result.statuscode).json({
          statuscode: result.statuscode,
          powered_by: "ServerPe App Solutions",
          successstatus: result.successstatus,
          message: result.message,
        });
      }
      const { user_name, mobile_number, email, query_type_id, message } =
        req.body;
      result = await insertContactQuery(
        user_name,
        mobile_number,
        email,
        query_type_id,
        message,
      );
      return res.status(result.statuscode).json({
        statuscode: result.statuscode,
        powered_by: "ServerPe App Solutions",
        successstatus: result.successstatus,
        message: result.message,
      });
    } catch (err) {
      return res.status(500).json({
        statuscode: 500,
        powered_by: "ServerPe App Solutions",
        successstatus: false,
        message: `Internal server error. Error:${err.message}`,
      });
    } finally {
    }
  },
);
module.exports = publicRouter;
