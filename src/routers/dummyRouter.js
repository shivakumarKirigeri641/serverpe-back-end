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
        result = await proceedBooking(client, req.body);
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
        result = await confirmBooking(client, req.body);
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
        result = await cancel_ticket(client, req.body);
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
//pnr-status
dummyRouter.post("/pnr-status", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);
  try {
    const { pnr } = req.body;
    if (!pnr) {
      return sendError(res, { status: 400, message: `PNR not found!` });
    }
    const result = await getPnrStatus(client, pnr);
    return sendSuccess(res, result, "PNR status fetched");
  } catch (err) {
    return sendError(res, err);
  }
});
//booking-history
dummyRouter.post("/booking-history", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);
  try {
    const { mobile_number } = req.body;
    if (!mobile_number) {
      return sendError(res, {
        status: 400,
        message: `Mobile number not found!`,
      });
    }
    const result = await getBookingHistory(client, mobile_number);
    return sendSuccess(res, result, "Booking history fetched");
  } catch (err) {
    return sendError(res, err);
  }
});
//pnr-status
dummyRouter.post("/live-train-running-status", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);
  try {
    const { train_number } = req.body;
    if (!train_number) {
      return sendError(res, {
        status: 400,
        message: `Train information not found!`,
      });
    }
    const result = await getLiveTrainRunningInformation(client, train_number);
    return sendSuccess(res, result, "Live train running status fetched");
  } catch (err) {
    return sendError(res, err);
  }
});
//connection-health
dummyRouter.get("/connection-health", async (req, res) => {
  res.status(200).json({ status: "OK" });
});
//live station->get list of trains which are arrivign/departing from given station
dummyRouter.post("/live-station", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);
  try {
    const hours = [2, 4, 8];
    const { station_code, next_hours } = req.body;
    if (!station_code) {
      return sendError(res, {
        status: 400,
        message: `Station information not found!`,
      });
    }
    if (!next_hours) {
      return sendError(res, {
        status: 400,
        message: `Hours information not found!`,
      });
    }
    if (!Number.isInteger(next_hours)) {
      return sendError(res, {
        status: 400,
        message: `Invalid hours information found!`,
      });
    }
    if (!hours.includes(next_hours)) {
      return sendError(res, {
        status: 400,
        message: `Invalid hours value found!`,
      });
    }
    const result = await getLiveStation(client, station_code, next_hours);
    return sendSuccess(res, result, "Live station data fetched");
  } catch (err) {
    return sendError(res, err);
  }
});
//test
dummyRouter.post("/test", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);
  try {
    //await fillCancelledSeats(client, "11312");
    await prepareChart();
    res.send("RE FILL on cancellation in testing");
  } catch (err) {
    res.send(err.message);
  } finally {
  }
});
module.exports = dummyRouter;
