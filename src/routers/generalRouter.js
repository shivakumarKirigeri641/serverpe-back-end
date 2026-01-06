const express = require("express");
const getDisclaimerBeforeBuyList = require('../SQL/main/getDisclaimerBeforeBuyList');
const path = require("path");
const getTestimonials = require("../SQL/main/getTestimonials");
const insertContactMeData = require("../SQL/main/insertContactMeData");
const validateForAddingContactMeData = require("../validations/main/validateForAddingContactMeData");
const getAllFeedbackCategories = require("../SQL/main/getAllFeedbackCategories");
const validateSendOtp = require("../validations/main/validateSendOtp");
const generateToken = require("../utils/generateToken");
const getPostgreClient = require("../SQL/getPostgreClient");
const getMockApiCategoryDownloadPaths = require("../SQL/main/getMockApiCategoryDownloadPaths");
const {
  connectMainDB,
  connectMockTrainTicketsDb,
} = require("../database/connectDB");
const insertotpentry = require("../SQL/main/insertotpentry");
const getStatesAndTerritories = require("../SQL/main/getStatesAndTerritories");
const validateotp = require("../SQL/main/validateotp");
const validateverifyOtp = require("../validations/main/validateverifyOtp");
const generalRouter = express.Router();
const fetchApiPlans = require("../SQL/main/fetchApiPlans");
const securityMiddleware = require("../middleware/securityMiddleware");
const getApiEndPoints = require("../SQL/main/getApiEndPoints");
const generateOtp = require("../utils/generateOtp");
require("dotenv").config();
const Redis = require("ioredis");
const convertDocxToPdf = require("../utils/convertDocxToPdf");
const getProjectList = require("../SQL/main/getProjectList");
const insertLoginOtpEntry = require("../SQL/main/insertLoginOtpEntry");
const validateLoginSendOtp = require("../validations/main/validateLoginSendOtp");
const validateverifyLoginOtp = require("../validations/main/validateVerifyingOtp");
const validateVerifyingOtp = require("../validations/main/validateVerifyingOtp");
const validateLoginOtp = require("../SQL/main/validateLoginOtp");

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  reconnectOnError: () => true,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
  tls: {}, // IMPORTANT for redis.io URLs with TLS (rediss://)
});
const poolMain = connectMainDB();
// ======================================================
//                SEND OTP
// ======================================================
generalRouter.post("/mockapis/serverpeuser/send-otp", async (req, res) => {
  try {
    let validationresult = validateSendOtp(req.body);

    if (validationresult.successstatus) {
      //const result_otp = "1234"; // static for now
      const result_otp = generateOtp();
      validationresult = await insertotpentry(poolMain, req.body, result_otp);
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
//                VERIFY OTP
// ======================================================
generalRouter.post("/mockapis/serverpeuser/verify-otp", async (req, res) => {
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
        req.body.otp,
        ipAddress
      );
      if (validateforverifyotpresult.successstatus) {
        const token = generateToken(req.body.mobile_number);
        res.cookie("token", token, {
          httpOnly: true,
          secure: true, // REQUIRED for SameSite=None
          sameSite: "None", // REQUIRED for cross-domain React → Node
          domain: ".serverpe.in",
        });
        /*res.cookie("token", token, {
          httpOnly: true,
          secure: false, // must be false because you're not using HTTPS
          sameSite: "lax", // must be lax or strict on localhost
          maxAge: 10 * 60 * 1000,
        });*/
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
//                testimonials
// ======================================================
generalRouter.get("/mockapis/serverpeuser/testimonials", async (req, res) => {
  try {
    const testimonialsdata = await getTestimonials(poolMain, req);
    return res.status(testimonialsdata.statuscode).json(testimonialsdata);
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
});
// ======================================================
//                add to contact me
// ======================================================
generalRouter.post("/mockapis/serverpeuser/contact-me", async (req, res) => {
  try {
    let resultcontactme = validateForAddingContactMeData(req);
    if (resultcontactme.successstatus) {
      resultcontactme = await insertContactMeData(
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
// ======================================================
//                feedback catagories
// ======================================================
generalRouter.get(
  "/mockapis/serverpeuser/feedback-categories",
  async (req, res) => {
    try {
      const feedbackcategories = await getAllFeedbackCategories(poolMain);
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
//                api get state list (unchargeable)
// ======================================================
generalRouter.get("/mockapis/serverpeuser/states", async (req, res) => {
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
//                API plans
// ======================================================
generalRouter.get("/mockapis/serverpeuser/api-plans", async (req, res) => {
  try {
    const plansResult = await fetchApiPlans(poolMain, true);
    return res.status(plansResult.statuscode).json(plansResult);
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
//                API all endpionts
// ======================================================
generalRouter.get("/mockapis/serverpeuser/all-endpoints", async (req, res) => {
  try {
    const apiendpoints = await getApiEndPoints(poolMain);
    return res.status(apiendpoints.statuscode).json(apiendpoints);
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
//                download api-doc-zips
// ======================================================
generalRouter.get(
  "/mockapis/serverpeuser/download/apidoc/:id",
  async (req, res) => {
    try {
      const { id } = req?.params;
      if (!id) {
        throw {
          error: "Internal Server Error",
          message: "Invalid mock api caetgory id provided!",
        };
      }
      const result = await getMockApiCategoryDownloadPaths(poolMain, id);
      console.log("result from apidoc:", result.data[0].api_doc_path);
      if (result.successtatus) {
        const filePath = path.join(
          path.resolve(__dirname, "..", ".."),
          result.data[0].api_doc_path
        );
        res.download(filePath, (err) => {
          if (err) {
            console.error("File download error:", err);
            res.status(500).json({
              poweredby: "serverpe.in",
              mock_data: true,
              success: false,
              message: "Unable to download file",
            });
          }
        });
      }
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
//                download postman-collection
// ======================================================
generalRouter.get(
  "/mockapis/serverpeuser/download/postmancollection/:id",
  async (req, res) => {
    try {
      const { id } = req?.params;
      if (!id) {
        throw {
          error: "Internal Server Error",
          message: "Invalid mock api caetgory id provided!",
        };
      }
      const result = await getMockApiCategoryDownloadPaths(poolMain, id);
      if (result.successtatus) {
        const filePath = path.join(
          path.resolve(__dirname, "..", ".."),
          result.data[0].api_postman_collection_path
        );
        res.download(filePath, (err) => {
          if (err) {
            console.error("File download error:", err);
            res.status(500).json({
              poweredby: "serverpe.in",
              mock_data: true,
              success: false,
              message: "Unable to download file",
            });
          }
        });
      }
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
//health check
// ======================================================
generalRouter.get("/mockapis/health/check", async (req, res) => {
  try {
    res.status(200).json({ status: "ok" });
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
});








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
        const token = generateToken(req.body.mobile_number);
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
module.exports = generalRouter;
