const express = require("express");
const {downloadInvoicePdf}=require("../utils/downloadInvoicePdf");
const crypto = require("crypto");
const razorpay = require("../utils/razorpay");
const updateStudentProfileByMobile = require("../SQL/main/updateStudentProfileByMobile");
const { connectMainDB } = require("../database/connectDB");
const checkServerPeUser = require("../middleware/checkServerPeUser");
const userRouter = express.Router();
require("dotenv").config();
const getStudentUserProfile = require("../SQL/main/getStudentUserProfile");
const validateStudentMobileNumber = require("../SQL/main/validateStudentMobileNumber");
const getStudentPurchaseHistory = require("../SQL/main/getStudentPurchaseHistory");
const getStudentPurchaseProjectDetails = require("../SQL/main/getStudentPurchaseProjectDetails");
const getStudentPurchasedDetails = require("../SQL/main/getPurchasedDetails");
const validateForAmount = require("../utils/validateForAmount");
const inserTransactions = require("../SQL/main/inserTransactions");
const downloadProjectZipByLicense = require("../SQL/main/downloadProjectZipByLicense");

const poolMain = connectMainDB();


// ======================================================
//                student-user profile
// ======================================================
userRouter.get(
  "/serverpeuser/loggedinstudent/user-profile",  
  checkServerPeUser,
  async (req, res) => {    
    try {
      if (!validateStudentMobileNumber(poolMain, req.mobile_number)) {
        res.status(401).json({
          poweredby: "serverpe.in",
          mock_data: true,
          status: "Failed",
          successstatus: false,
          message: "Unauthorized user!",
        });
      }
      const result_userprofile = await getStudentUserProfile(poolMain, req);
      return res.status(result_userprofile.statuscode).json(result_userprofile);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                update student-user profile
// ======================================================
userRouter.patch(
  "/serverpeuser/loggedinstudent/user-profile",
  checkServerPeUser,
  async (req, res) => {
    try {
      // 🔐 Validate logged-in student by mobile number
      const isValidUser = await validateStudentMobileNumber(
        poolMain,
        req.mobile_number
      );

      if (!isValidUser) {
        return res.status(401).json({
          poweredby: "serverpe.in",
          mock_data: true,
          status: "Failed",
          successstatus: false,
          message: "Unauthorized user!",
        });
      }

      // 🔄 Update profile using mobile number
      const result_updateProfile = await updateStudentProfileByMobile(
        poolMain,
        req
      );

      return res.status(result_updateProfile.statuscode).json({
        poweredby: "serverpe.in",
        mock_data: false,
        ...result_updateProfile,
      });

    } catch (err) {
      console.error("Update Profile Error:", err);

      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        error: "Internal Server Error",
        message: err.message,
      });
    }
  }
);
// ======================================================
//                student-purchase history
// ======================================================
userRouter.get(
  "/serverpeuser/loggedinstudent/purchase-history",  
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      const result_userprofile = await getStudentPurchaseHistory(poolMain, req);
      return res.status(result_userprofile.statuscode).json(result_userprofile);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);

// ======================================================
//                student-purchase details
// ======================================================
userRouter.get(
  "/serverpeuser/loggedinstudent/purchase-details/:project_id",  
  checkServerPeUser,
  async (req, res) => {    
    try {
      if(!req.params.project_id){
        return res.status(400).json({
          poweredby: "serverpe.in",
          mock_data: true,
          status: "Failed",
          successstatus: false,
          message: "Invalid project_id number!",
        });
      }
      const result_userprofile = await getStudentPurchaseProjectDetails(poolMain, req, req.params.project_id);
      return res.status(result_userprofile.statuscode).json(result_userprofile);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                student-purchased details
// ======================================================
userRouter.get(
  "/serverpeuser/loggedinstudent/purchased-details/:order_number",  
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      if(!req.params.order_number){
        return res.status(400).json({
          poweredby: "serverpe.in",
          mock_data: true,
          status: "Failed",
          successstatus: false,
          message: "Invalid order number!",
        });
      }
      const result_purchaseddetails = await getStudentPurchasedDetails(poolMain, req.params.order_number);
      return res.status(result_purchaseddetails.statuscode).json(result_purchaseddetails);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                student-logout
// ======================================================
userRouter.post(
  "/serverpeuser/loggedinstudent/logout",  
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false, // matches the setting in login
        sameSite: "lax",
        path: "/",
      });
      return res.status(200).json({status:'ok', message:'Logged out successfully'});
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                razorpay order
// ======================================================
userRouter.post(
  "/serverpeuser/loggedinuser/razorpay/order",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      const { amount } = req.body; // amount in INR
      let result_order = validateForAmount(req);
      if (result_order.successstatus) {
        result_order = await razorpay.orders.create({
          amount: amount * 100, // INR → paise
          currency: "INR",
          receipt: `serverpe_${Date.now()}`,
          payment_capture: 1,
        });
      }
      result_order.statuscode = 200;
      return res.status(result_order.statuscode).json(result_order);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                razorpay verify
// ======================================================
userRouter.post(
  "/serverpeuser/loggedinuser/razorpay/verify",
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        // ✅ Payment verified
        return res.json({
          poweredby: "serverpe.in",
          mock_data: true,
          statuscode: 200,
          successstatus: true,
        });
      } else {
        return res
          .status(400)
          .json({ poweredby: "serverpe.in", mock_data: true, success: false });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        error: "Internal Server Error",
        message: err.message,
      });
    } finally {
      //if (poolMain) client.release();
    }
  }
);
// ======================================================
//                razorpay order-status
// ======================================================
userRouter.post(
  "/serverpeuser/loggedinuser/razorpay/status",
  checkServerPeUser,
  async (req, res) => {    
    try {
      const { razorpay_payment_id, summaryFormData } = req.body;
      let result = await razorpay.payments.fetch(razorpay_payment_id);      
      let result_status = await inserTransactions(
        poolMain,
        result,
        req.mobile_number,
        summaryFormData
      );      
      //create invoice pdf here and store it in docs/invoices.
      //const { filePath, fileName } = generateInvoicePdf(result);
      console.log(result_status);
      return res.status(200).json({
        poweredby: "serverpe.in",
        mock_data: false,
        successstatus: result_status.successstatus,
        statuscode: result_status.statuscode,
        data: result_status,
      });
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
  }
);
// ======================================================
//                download .zip project
// ======================================================
userRouter.get(
  "/serverpeuser/loggedinuser/project/download/:license_key",
  checkServerPeUser,
  async (req, res) => {
    try {
      const { license_key } = req.params;
      const mobile_number = req.mobile_number;

      const result = await downloadProjectZipByLicense(
        poolMain,
        license_key,
        mobile_number,
        req.ip
      );

      if (!result.successstatus) {
        return res.status(result.statuscode).json({
          poweredby: "serverpe.in",
          mock_data: false,
          ...result
        });
      }

      // 🔽 Send ZIP securely
      return res.download(result.file_path, result.file_name);

    } catch (err) {
      console.error("ZIP Download Error:", err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        message: "Internal Server Error"
      });
    }
  }
);
// ======================================================
//                download invoice (PDF)
// ======================================================
userRouter.get(
  "/serverpeuser/loggedinuser/invoice/download/:invoice_id",
  checkServerPeUser,
  async (req, res) => {
    try {
      const { invoice_id } = req.params;
      const mobile_number = req.mobile_number;

      if (!invoice_id || isNaN(invoice_id)) {
        return res.status(400).json({
          poweredby: "serverpe.in",
          mock_data: false,
          successstatus: false,
          message: "Invalid invoice id"
        });
      }

      const result = await downloadInvoicePdf(
        poolMain,
        invoice_id,
        mobile_number,
        req.ip
      );

      if (!result.successstatus) {
        return res.status(result.statuscode).json({
          poweredby: "serverpe.in",
          mock_data: false,
          ...result
        });
      }

      // 🔽 Send PDF securely
      return res.download(result.file_path, result.file_name);

    } catch (err) {
      console.error("Invoice Download Error:", err);
      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        message: "Internal Server Error"
      });
    }
  }
);

module.exports = userRouter;
