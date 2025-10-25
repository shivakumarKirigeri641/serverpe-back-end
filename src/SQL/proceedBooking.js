const insertbookingdata_3a = require("./insertion/insertbookingdata_3a");
const insertbookingdata_1a = require("./insertion/insertbookingdata_1a");
const insertbookingdata_fc = require("./insertion/insertbookingdata_fc");
const insertbookingdata_2a = require("./insertion/insertbookingdata_2a");
const insertbookingdata_sl = require("./insertion/insertbookingdata_sl");
const proceedBooking = async (client, booking_details) => {
  let booking_summary = null;
  try {
    await client.query("BEGIN");
    //overall valiations
    if (
      booking_details.reservation_type == "LADIES" &&
      2 < booking_details.passenger_details.length
    ) {
      throw {
        status: 200,
        success: false,
        message:
          "Ladies quota must be female passengers and maximum 2 female passengers!",
      };
    }
    if (
      booking_details.reservation_type == "PWD" &&
      1 != booking_details.passenger_details.length
    ) {
      throw {
        status: 200,
        success: false,
        message: "PWD booking can be done only for 1 person!",
      };
    }
    //overall valiations
    await client.query("BEGIN");
    switch (booking_details.coach_type) {
      case "SL":
        booking_summary = await insertbookingdata_sl(client, booking_details);
        break;
      case "1A":
        booking_summary = await insertbookingdata_1a(client, booking_details);
        break;
      case "2A":
        booking_summary = await insertbookingdata_2a(client, booking_details);
        break;
      case "3A":
        booking_summary = await insertbookingdata_3a(client, booking_details);
        break;
      case "2S":
        break;
      case "CC":
        break;
      case "EC":
        break;
      case "EA":
        break;
      case "E3":
        break;
      case "FC":
        booking_summary = await insertbookingdata_fc(client, booking_details);
        break;
      default:
        throw {
          status: 401,
          success: false,
          message: "Invalid coach type for booking!",
          data: {},
        };
    }
    await client.query("COMMIT");
    return booking_summary;
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    throw err;
  } finally {
    if (client) {
      await client.release();
    }
  }
};
module.exports = proceedBooking;
