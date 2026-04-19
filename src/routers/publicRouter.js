const express = require("express");
const publicRouter = express.Router();
const getQueryTypes = require("../repos/gets/getQueryTypes");
const { sendMail } = require("../utils/email/sendMail");
const userVisitLandingPageAlertTemplate = require("../utils/email/userVisitLandingPageAlertTemplate");
const getPrivacyPolicy = require("../repos/gets/getPrivacyPolicy");
const {
  authLimiter,
  sensitiveOpLimiter,
} = require("../middlewares/rateLimiter");
const validateForContactUs = require("../validators/validateForContactUs");
const insertContactQuery = require("../repos/insertions/insertContactQuery");
const getTermsAndConditions = require("../repos/gets/getTermsAndConditions");
// ======================================================
//                QUERY-TYPES
// ======================================================
publicRouter.get("/serverpe/platform/public/query-types", async (req, res) => {
  try {
    const result = await getQueryTypes();
    let result_ipdetails = null;
    let ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    let visitTime = Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const ua = req.headers["user-agent"] || "";

    // Detect browser
    let browser = "Unknown Browser";
    if (/edg\//i.test(ua)) browser = "Microsoft Edge";
    else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = "Opera";
    else if (/chrome/i.test(ua)) browser = "Google Chrome";
    else if (/safari/i.test(ua)) browser = "Safari";
    else if (/firefox/i.test(ua)) browser = "Firefox";

    // Detect OS
    let os = "Unknown OS";
    if (/windows/i.test(ua)) os = "Windows";
    else if (/macintosh|mac os/i.test(ua)) os = "macOS";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone/i.test(ua)) os = "iOS (iPhone)";
    else if (/ipad/i.test(ua)) os = "iOS (iPad)";
    else if (/linux/i.test(ua)) os = "Linux";

    // Detect device type
    let deviceType = "Desktop/Laptop";
    if (/mobile|iphone|android.*mobile/i.test(ua)) deviceType = "Mobile";
    else if (/tablet|ipad|android(?!.*mobile)/i.test(ua)) deviceType = "Tablet";

    let devicename = `${deviceType} | ${os} | ${browser}`;
    if (ipAddress !== "::1") {
      result_ipdetails = await axios.get(`https://ipinfo.io/${ipAddress}/json`);
    }
    await sendMail({
      to: process.env.ADMINMAIL,
      subject: "An user landing page visit alert",
      html: userVisitLandingPageAlertTemplate({
        ipAddress,
        visitTime,
        devicename,
        result_ipdetails,
      }),
      text: "Alert! User visited landing page",
    });
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
      result = await insertContactQuery(req);
      return res.status(result.statuscode).json({
        statuscode: result.statuscode,
        powered_by: "ServerPe App Solutions",
        successstatus: result.successstatus,
        message: result.message,
        data: result?.data,
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
// ======================================================
//                PRIVACY-POLICY
// ======================================================
publicRouter.get(
  "/serverpe/platform/public/privacy-policy",
  async (req, res) => {
    try {
      const result = await getPrivacyPolicy();
      return res.status(result.statuscode).json({
        statuscode: result.statuscode,
        powered_by: "ServerPe App Solutions",
        successstatus: result.successstatus,
        message: result.message,
        data: result?.data,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        successstatus: false,
        message: err.message,
      });
    }
  },
);
// ======================================================
//                TERMS-AND-CONDITIONS
// ======================================================
publicRouter.get(
  "/serverpe/platform/public/terms-and-conditions",
  async (req, res) => {
    try {
      const result = await getTermsAndConditions();
      return res.status(result.statuscode).json({
        statuscode: result.statuscode,
        powered_by: "ServerPe App Solutions",
        successstatus: result.successstatus,
        message: result.message,
        data: result?.data,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
        successstatus: false,
        message: err.message,
      });
    }
  },
);
module.exports = publicRouter;
