const express = require("express");
const getLiveStation = require("../SQL/fetchers/getLiveStation");
const getBookingHistory = require("../SQL/fetchers/getBookingHistory");
const getLiveTrainRunningInformation = require("../SQL/fetchers/getLiveTrainRunningInformation");
const prepareChart = require("../SQL/reservations/prepareChart");
const searchTrainsBetweenSatations = require("../SQL/fetchers/searchTrainsBetweenSatations");
const getPnrStatus = require("../SQL/fetchers/getPnrStatus");
const getReservationType = require("../SQL/fetchers/getReservationType");
const getCoachType = require("../SQL/fetchers/getCoachType");
const validateForTrainNumber = require("../validations/mocktrainreservations/validateForTrainNumber");
const {
  connectMockTrainTicketsDb,
  connectMainDB,
} = require("../database/connectDB");
const mockTrainReservedTicketRouter = express.Router();
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
const securityMiddleware = require("../middleware/securityMiddleware");
require("dotenv").config();
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  reconnectOnError: () => true,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
  tls: {}, // IMPORTANT for redis.io URLs with TLS (rediss://)
});
let usageStatus = {};
// ======================================================
//                api get stations list (unchargeable)
// ======================================================
mockTrainReservedTicketRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/stations",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      const result = await getStations(clientMockTrain);
      /*if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }*/
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api get reservation type (unchargeable)
// ======================================================
mockTrainReservedTicketRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/reservation-type",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      const result = await getReservationType(clientMockTrain);
      /*if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }*/
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api get coach type (unchargeable)
// ======================================================
mockTrainReservedTicketRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/coach-type",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      const result = await getCoachType(clientMockTrain);
      /*if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }*/
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api get train-schedule
// ======================================================
mockTrainReservedTicketRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/train-schedule",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      let result = validateForTrainNumber(req);
      if (result.successstatus) {
        result = await getTrainSchedule(clientMockTrain, req.body.train_number);
      }
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post search-trains
// ======================================================
mockTrainReservedTicketRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/search-trains",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  async (req, res, next) => {
    let clientMain;
    let clientMockTrain;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      // Validate request
      let result = validateForSearchTrains(req);
      //repair

      // 200 → auto usage deduct middleware will run
      // 1️⃣ Atomic usage deduction (fixed)
      if (result.successstatus) {
        result = await searchTrains(
          clientMockTrain,
          req.body.source_code.toUpperCase(),
          req.body.destination_code.toUpperCase(),
          req.body.doj
        );
      }
      if (!result.statuscode) {
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      next(err);
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post trains between two stations
// ======================================================
mockTrainReservedTicketRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/trains-between-two-stations",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      //validation later
      let result = validateForTrainsBetweenTwostations(req);
      if (result.successstatus) {
        result = await searchTrainsBetweenSatations(
          clientMockTrain,
          req.body.source_code.toUpperCase(),
          req.body.destination_code.toUpperCase(),
          req.body.via_code
        );
      }
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);

// ======================================================
//                api post proceed-booking
// ======================================================
mockTrainReservedTicketRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/proceed-booking",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);

      let result = validateForProceedBooking(req);
      if (result.successstatus) {
        result = await proceedBooking(clientMockTrain, req.body);
      }
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post confirm-ticket
// ======================================================
mockTrainReservedTicketRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/confirm-ticket",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      let result = validateForConfirmBooking(req);
      //handle throw
      if (result.successstatus) {
        result = await confirmBooking(
          clientMockTrain,
          req.body.booking_id,
          req.body.can_send_mock_ticket_sms
        );
      }
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post cancel-ticket
// ======================================================
mockTrainReservedTicketRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/cancel-ticket",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      let result = validateForCancelTicket(req);
      //handle throw
      if (result.successstatus) {
        result = await cancel_ticket(clientMockTrain, req.body);
      }
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post pnr-status
// ======================================================
mockTrainReservedTicketRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/pnr-status",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      const start = Date.now();
      clientMain = await getPostgreClient(poolMain);
      clientMockTrain = await getPostgreClient(poolMockTrain);
      let result = validateForPNRStatus(req);
      //handle throw
      if (result.successstatus) {
        result = await getPnrStatus(clientMockTrain, req.body.pnr);
      }
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post booking-history
// ======================================================
mockTrainReservedTicketRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/booking-history",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      const start = Date.now();
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
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post live-train-running-status
// ======================================================
mockTrainReservedTicketRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/train-live-running-status",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    try {
      const start = Date.now();
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
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
// ======================================================
//                api post live station->get list of trains which are arrivign/departing from given station
// ======================================================
mockTrainReservedTicketRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/live-station",
  securityMiddleware(redis, {
    rateLimit: 3, // 3 req/sec
    scraperLimit: 50, // 50 req/10 sec
    windowSeconds: 10, // detect scraping in 10 sec window
    blockDuration: 3600, // block for 1 hour
  }),
  checkApiKey,
  async (req, res) => {
    let clientMain;
    let clientMockTrain;
    let usageStatus = {};
    try {
      const start = Date.now();
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
      if (!result.statuscode) {
        // 1️⃣ Atomic usage deduction (fixed)
        usageStatus = await updateApiUsage(clientMain, req, start);
        if (!usageStatus.ok) {
          return res.status(429).json({
            error: usageStatus.message,
          });
        }
      }
      return res.status(result.statuscode ? result.statuscode : 200).json({
        success: true,
        remaining_calls: usageStatus.remaining,
        data: result,
      });
    } catch (err) {
      console.error("API Error:", err);
      return res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
    } finally {
      if (clientMain) clientMain.release();
      if (clientMockTrain) clientMockTrain.release();
    }
  }
);
module.exports = mockTrainReservedTicketRouter;
