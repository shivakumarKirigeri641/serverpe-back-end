const express = require("express");
const { connectMainDB } = require("../database/connectDB");
const getAllStudentContactCategories = require('../SQL/main/getAllStudentContactCategories');
const getDisclaimerBeforeBuyList = require('../SQL/main/getDisclaimerBeforeBuyList');
const validateForAddingContactMeData = require("../validations/main/validateForAddingContactMeData");
const validateSendOtp = require("../validations/main/validateSendOtp");
const generateToken = require("../utils/generateToken");
const getStatesAndTerritories = require("../SQL/main/getStatesAndTerritories");
const validateotp = require("../SQL/main/validateotp");
const validateverifyOtp = require("../validations/main/validateverifyOtp");
const generalRouter = express.Router();
require("dotenv").config();
const getProjectList = require("../SQL/main/getProjectList");
const insertLoginOtpEntry = require("../SQL/main/insertLoginOtpEntry");
const validateLoginSendOtp = require("../validations/main/validateLoginSendOtp");
const validateVerifyingOtp = require("../validations/main/validateVerifyingOtp");
const validateLoginOtp = require("../SQL/main/validateLoginOtp");
const insertStudentContactMeData = require("../SQL/main/insertStudentContactMeData");
const poolMain = connectMainDB();
// ======================================================
//                api get state list (unchargeable)
// ======================================================
generalRouter.get("/serverpeuser/mystudents/states", async (req, res) => {
  try {
    // 2️⃣ Business Logic
    const result = await getStatesAndTerritories(poolMain);
    return res.status(result.statuscode ? result.statuscode : 200).json({
      poweredby: "serverpe.in",
      mock_data: true,
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({
      poweredby: "serverpe.in",
      mock_data: true,
      error: "Internal Server Error",
      message: err.message,
    });
  } finally {
  }
});
// ======================================================
//                project list
// ======================================================
generalRouter.get(
  "/serverpeuser/mystudents/project-list",
  async (req, res) => {
    try {
      const projectlist = await getProjectList(poolMain);
      return res.status(projectlist.statuscode).json(projectlist);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
        message: err.message,
      });
    } finally {
    }
  }
);
// ======================================================
// new approach for studnents
// subscription send otp
// ======================================================
generalRouter.post("/serverpeuser/mystudents/subscription/send-otp", async (req, res) => {
  try {
    let validationresult = validateSendOtp(req.body);

    if (validationresult.successstatus) {
      const result_otp_mobile = "1234"; // static for now
      const result_otp_email = "5678"; // static for now
      //const result_otp = generateOtp();
      validationresult = await insertotpentry(poolMain, req.body);
    }

    return res.status(validationresult.statuscode).json(validationresult);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      poweredby: "serverpe.in",
      mock_data: true,
      error: "Internal Server Error",
      message: err.message,
    });
  } finally {
  }
});
// ======================================================
//                STUDENT-VERIFY OTP
//      subscription verify otp
// ======================================================
generalRouter.post("/serverpeuser/mystudents/subscription/verify-otp", async (req, res) => {
  try {
    const ipAddress =
      (req.headers["x-forwarded-for"] &&
        req.headers["x-forwarded-for"].split(",")[0]) ||
      req.socket?.remoteAddress ||
      null;
    let validateforverifyotpresult = validateverifyOtp(req.body);
    if (validateforverifyotpresult.successstatus) {
      validateforverifyotpresult = await validateotp(
        poolMain,
        req.body.mobile_number,
        req.body.email,
        req.body.mobile_otp,
        req.body.email_otp, 
        ipAddress
      );
    }

    return res
      .status(validateforverifyotpresult.statuscode)
      .json(validateforverifyotpresult);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      poweredby: "serverpe.in",
      mock_data: true,
      error: "Internal Server Error",
      message: err.message,
    });
  } finally {
  }
});
// ======================================================
// new approach for studnents
// login send otp
// ======================================================
generalRouter.post("/serverpeuser/mystudents/login/send-otp", async (req, res) => {
  try {
    let validationresult = validateLoginSendOtp(req.body);

    if (validationresult.successstatus) {
      const result_otp = "1234"; // static for now      
      //const result_otp = generateOtp();
      validationresult = await insertLoginOtpEntry(poolMain, req.body, result_otp);
    }

    return res.status(validationresult.statuscode).json(validationresult);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      poweredby: "serverpe.in",
      mock_data: true,
      error: "Internal Server Error",
      message: err.message,
    });
  } finally {
  }
});
// ======================================================
//                STUDENT-VERIFY OTP
//      login verify otp
// ======================================================
generalRouter.post("/serverpeuser/mystudents/login/verify-otp", async (req, res) => {
  try {
    const ipAddress =
      (req.headers["x-forwarded-for"] &&
        req.headers["x-forwarded-for"].split(",")[0]) ||
      req.socket?.remoteAddress ||
      null;
    let validateforverifyotpresult = validateVerifyingOtp(req.body);
    if (validateforverifyotpresult.successstatus) {
      validateforverifyotpresult = await validateLoginOtp(
        poolMain,
        req.body.input_field,
        req.body.otp, 
        ipAddress
      );
      if (validateforverifyotpresult.successstatus) {
        const token = generateToken(validateforverifyotpresult?.data?.mobile_number);
        /*res.cookie("token", token, {
          httpOnly: true,
          secure: true, // REQUIRED for SameSite=None
          sameSite: "None", // REQUIRED for cross-domain React → Node
          domain: ".serverpe.in",
        });*/
        res.cookie("token", token, {
          httpOnly: true,
          secure: false, // must be false because you're not using HTTPS
          sameSite: "lax", // must be lax or strict on localhost
          maxAge: 10 * 60 * 1000,
        });
      }
    }

    return res
      .status(validateforverifyotpresult.statuscode)
      .json(validateforverifyotpresult);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      poweredby: "serverpe.in",
      mock_data: true,
      error: "Internal Server Error",
      message: err.message,
    });
  } finally {
  }
});
// ======================================================
//                disclaimer_before_buy_list
// ======================================================
generalRouter.get(
  "/serverpeuser/mystudents/disclaimer-before-buy-list",
  async (req, res) => {
    try {
      const disclaimerlist = await getDisclaimerBeforeBuyList(poolMain);
      return res.status(disclaimerlist.statuscode).json(disclaimerlist);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
        message: err.message,
      });
    } finally {
    }
  }
);
// ======================================================
//                contactme-categories
// ======================================================
generalRouter.get(
  "/serverpeuser/mystudents/contact-categories",
  async (req, res) => {
    try {
      const feedbackcategories = await getAllStudentContactCategories(poolMain);
      return res.status(feedbackcategories.statuscode).json(feedbackcategories);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
        message: err.message,
      });
    } finally {
    }
  }
);
// ======================================================
//                contactme-categories addition
// ======================================================
generalRouter.post("/serverpeuser/mystudents/contact-categories", async (req, res) => {
  try {
    let resultcontactme = validateForAddingContactMeData(req);
    if (resultcontactme.successstatus) {
      resultcontactme = await insertStudentContactMeData(
        poolMain,
        req.body.user_name,
        req.body.email,
        req.body.rating ? req.body.rating : 5,
        req.body.category_name,
        req.body.message
      );
    }
    return res.status(resultcontactme.statuscode).json(resultcontactme);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      poweredby: "serverpe.in",
      mock_data: true,
      error: "Internal Server Error",
      message: err.message,
    });
  } finally {
  }
});
module.exports = generalRouter;
