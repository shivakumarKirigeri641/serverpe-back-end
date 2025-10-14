const insertbookingdata_sl = require("./insertion/insertbookingdata_sl");
const proceedBooking = async (client, booking_details) => {
  let search_train_details = null;
  try {
    await client.query("BEGIN");
    switch (booking_details.coach_type) {
      case "SL":
        search_train_details = await insertbookingdata_sl(
          client,
          booking_details
        );
        break;
      case "1A":
        break;
      case "2A":
        break;
      case "3A":
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
    return search_train_details;
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
