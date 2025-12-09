const express = require("express");
const getLiveStation = require("../SQL/fetchers/getLiveStation");
const getBookingHistory = require("../SQL/fetchers/getBookingHistory");
const getLiveTrainRunningInformation = require("../SQL/fetchers/getLiveTrainRunningInformation");
const prepareChart = require("../SQL/reservations/prepareChart");
const searchTrainsBetweenSatations = require("../SQL/fetchers/searchTrainsBetweenSatations");
const getPnrStatus = require("../SQL/fetchers/getPnrStatus");
const getReservationType = require("../SQL/fetchers/getReservationType");
const getCoachType = require("../SQL/fetchers/getCoachType");
const {
  connectMockTrainTicketsDb,
  connectMainDB,
} = require("../database/connectDB");
const dummyRouter = express.Router();
const getPostgreClient = require("../SQL/getPostgreClient");
const getTrainSchedule = require("../SQL/fetchers/getTrainSchedule");
const confirmBooking = require("../SQL/confirmBooking");
const proceedBooking = require("../SQL/proceedBooking");
const getStations = require("../SQL/fetchers/getStations");
const searchTrains = require("../SQL/fetchers/searchTrains");
const cancel_ticket = require("../SQL/reservations/cancel_ticket");
const checkApiKey = require("../middleware/checkApiKey");
const rateLimitPerApiKey = require("../middleware/rateLimitPerApiKey");
const updateApiUsage = require("../SQL/main/updateApiUsage");
const validateForSearchTrains = require("../validations/mocktrainreservations/validateForSearchTrains");
const validateForTrainsBetweenTwostations = require("../validations/mocktrainreservations/validateForTrainsBetweenTwostations");
const validateForProceedBooking = require("../validations/mocktrainreservations/validateForProceedBooking");
const validateForConfirmBooking = require("../validations/mocktrainreservations/validateForConfirmBooking");
const validateForCancelTicket = require("../validations/mocktrainreservations/validateForCancelTicket");
const validateForPNRStatus = require("../validations/mocktrainreservations/validateForPNRStatus");
const validateForBookingHistory = require("../validations/mocktrainreservations/validateForBookingHistory");
const validateForLiveTrainRunningStatus = require("../validations/mocktrainreservations/validateForLiveTrainRunningStatus");
const validateForLiveStation = require("../validations/mocktrainreservations/validateForLiveStation");
const poolMain = connectMainDB();
const poolMockTrain = connectMockTrainTicketsDb();
function sendSuccess(res, data = {}, message = "Success") {
  return res.status(200).json({ status: 200, success: true, message, data });
}

function sendError(res, err) {
  const status = err && err.status ? err.status : 500;
  const message =
    err && (err.message || err.msg)
      ? err.message || err.msg
      : "Internal server error";
  const data = err && err.data ? err.data : {};
  return res.status(status).json({ status, success: false, message, data });
}
// ======================================================
//                api get stations list
// ======================================================
dummyRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/stations",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }
      const result = await getStations(clientMockTrain);
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api get reservation type
// ======================================================
dummyRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/reservation-type",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }
      const result = await getReservationType(clientMockTrain);
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api get coach type
// ======================================================
dummyRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/coach-type",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }
      const result = await getCoachType(clientMockTrain);
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api get train-schedule
// ======================================================
dummyRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/train-schedule",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      // 1️⃣ Atomic usage deduction (fixed)
      const usageStatus = await updateApiUsage(clientMain, req);
      if (!usageStatus.ok) {
        return res.status(429).json({
          error: usageStatus.message,
        });
      }
      const result = await getTrainSchedule(clientMockTrain);
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post search-trains
// ======================================================
dummyRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/search-trains",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      //validation later
      let result = validateForSearchTrains(req);
      if (result.successstatus) {
        result = await searchTrains(
          clientMockTrain,
          source_code.toUpperCase(),
          destination_code.toUpperCase(),
          doj
        );
      }
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post trains between two stations
// ======================================================
dummyRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/trains-between-two-stations",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      //validation later
      let result = validateForTrainsBetweenTwostations(req);
      if (result.successstatus) {
        result = await await searchTrainsBetweenSatations(
          clientMockTrain,
          req.source_code.toUpperCase(),
          req.destination_code.toUpperCase(),
          via_code
        );
      }
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);

// ======================================================
//                api post proceed-booking
// ======================================================
dummyRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/proceed-booking",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);

      let result = validateForProceedBooking(req);
      if (result.successstatus) {
        result = await proceedBooking(clientMockTrain, req.body);
      }
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post confirm-ticket
// ======================================================
dummyRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/confirm-ticket",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);

      let result = validateForConfirmBooking(req);
      //handle throw
      if (result.successstatus) {
        result = await confirmBooking(clientMockTrain, req.body.booking_id);
      }
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post cancel-ticket
// ======================================================
dummyRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/cancel-ticket",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);

      let result = validateForCancelTicket(req);
      //handle throw
      if (result.successstatus) {
        result = await cancel_ticket(clientMockTrain, req.body);
      }
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post pnr-status
// ======================================================
dummyRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/pnr-status",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);

      let result = validateForPNRStatus(req);
      //handle throw
      if (result.successstatus) {
        result = await getPnrStatus(clientMockTrain, req.body.pnr);
      }
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post booking-history
// ======================================================
dummyRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/booking-history",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);

      let result = validateForBookingHistory(req);
      //handle throw
      if (result.successstatus) {
        result = await getBookingHistory(
          clientMockTrain,
          req.body.mobile_number
        );
      }
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post live-train-running-status
// ======================================================
dummyRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/train-live-running-status",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);

      let result = validateForLiveTrainRunningStatus(req);
      //handle throw
      if (result.successstatus) {
        result = await getLiveTrainRunningInformation(
          clientMockTrain,
          req.body.train_number
        );
      }
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post live station->get list of trains which are arrivign/departing from given station
// ======================================================
dummyRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/live-station",
  rateLimitPerApiKey(3, 1000),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);

      let result = validateForLiveStation(req);
      //handle throw
      if (result.successstatus) {
        result = await getLiveStation(
          clientMockTrain,
          req.body.station_code,
          req.body.next_hours
        );
      }
      return res.json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
module.exports = dummyRouter;
