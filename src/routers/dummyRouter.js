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
//stations
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
//reservation_type
dummyRouter.get("/reservation-type", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);
  try {
    //validation later
    const result = await getReservationType(client);
    return sendSuccess(res, result.rows, "Reservation type fetch successful");
  } catch (err) {
    return sendError(res, err);
  }
});
//coach_type
dummyRouter.get("/coach-type", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);
  try {
    //validation later
    const result = await getCoachType(client);
    return sendSuccess(res, result.rows, "Coach type fetch successful");
  } catch (err) {
    return sendError(res, err);
  }
});
//schedule
dummyRouter.post("/train-schedule", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);

  try {
    //validation later
    let { train_number } = req.body;
    const train_schedule_details = await getTrainSchedule(client, train_number);
    return sendSuccess(
      res,
      train_schedule_details,
      "Train schedule fetched successfully!"
    );
  } catch (err) {
    return sendError(res, err);
  }
});
//search trains
dummyRouter.post("/search-trains", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);

  try {
    //validation later
    let { source_code, destination_code, doj } = req.body;
    if (!source_code) {
      return sendError(res, { status: 400, message: `Source not found!` });
    }
    if (!destination_code) {
      return sendError(res, { status: 400, message: `Destination not found!` });
    }
    if (!doj) {
      return sendError(res, {
        status: 400,
        message: `Date of journey not found!`,
      });
    }
    const search_train_details = await searchTrains(
      client,
      source_code.toUpperCase(),
      destination_code.toUpperCase(),
      doj
    );
    if (search_train_details.trains_list.length === 0) {
      return sendSuccess(res, {}, "No trains found!");
    }
    return sendSuccess(res, search_train_details, "Trains fetch successful");
  } catch (err) {
    return sendError(res, err);
  }
});
//trains between two stations
dummyRouter.post("/trains-between-two-stations", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);

  try {
    //validation later
    let { source_code, destination_code, via_code } = req.body;
    if (!source_code) {
      return sendError(res, { status: 400, message: `Source not found!` });
    }
    if (!destination_code) {
      return sendError(res, { status: 400, message: `Destination not found!` });
    }
    const search_train_details = await searchTrainsBetweenSatations(
      client,
      source_code.toUpperCase(),
      destination_code.toUpperCase(),
      via_code
    );
    if (search_train_details.trains_list.length === 0) {
      return sendSuccess(res, {}, "No trains found!");
    }
    return sendSuccess(res, search_train_details, "Trains fetch successful");
  } catch (err) {
    return sendError(res, err);
  }
});
//prceed-booking
dummyRouter.post("/proceed-booking", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);
  let booking_summary = null;
  try {
    //validation later
    booking_summary = await proceedBooking(client, req.body);
    return sendSuccess(res, booking_summary, "Proceed booking successful");
  } catch (err) {
    return sendError(res, err);
  }
});
//confirm-ticket
dummyRouter.post("/confirm-booking", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);
  try {
    const ticket_details = await confirmBooking(client, req.body.booking_id);
    return sendSuccess(res, ticket_details, "Booking confirmed");
  } catch (err) {
    return sendError(res, err);
  }
});
//cancel-ticket
dummyRouter.post("/cancel-ticket", async (req, res) => {
  const pool = await connectMockTrainTicketsDb();
  const client = await getPostgreClient(pool);
  try {
    const { pnr, passengerids } = req.body;
    if (!pnr) {
      return sendError(res, { status: 400, message: `PNR not found!` });
    }
    if (!passengerids) {
      return sendError(res, {
        status: 400,
        message: `Passenger information not found!`,
      });
    }
    const result = await cancel_ticket(client, pnr, passengerids);
    return sendSuccess(res, result, "Cancellation processed");
  } catch (err) {
    return sendError(res, err);
  }
});
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
