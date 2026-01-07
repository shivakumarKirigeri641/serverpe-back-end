const express = require("express");
const { connectMainDB } = require("../database/connectDB");
const checkServerPeUser = require("../middleware/checkServerPeUser");
const userRouter = express.Router();
require("dotenv").config();
const getStudentUserProfile = require("../SQL/main/getStudentUserProfile");
const validateStudentMobileNumber = require("../SQL/main/validateStudentMobileNumber");
const getStudentPurchaseHistory = require("../SQL/main/getStudentPurchaseHistory");
const getStudentPurchaseProjectDetails = require("../SQL/main/getStudentPurchaseProjectDetails");
const getStudentPurchasedDetails = require("../SQL/main/getPurchasedDetails");
const poolMain = connectMainDB();


// ======================================================
//                student-user profile
// ======================================================
userRouter.get(
  "/serverpeuser/loggedinstudent/user-profile",  
  checkServerPeUser,
  async (req, res) => {
    let client;
    try {
      //client = await getPostgreClient(poolMain);
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
    let client;
    try {
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
      res.cookie("token", null);
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

module.exports = userRouter;
