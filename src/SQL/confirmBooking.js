const insertticketdata_sl = require("./insertion/insertticketdata_sl");
const insertticketdata_2a = require("./insertion/insertticketdata_2a");
const insertticketdata_3a = require("./insertion/insertticketdata_3a");
const confirmBooking = async (client, booking_id) => {
  let booking_summary = null;
  try {
    await client.query("BEGIN");
    //overall valiations
    const booking_details = await client.query(
      `select b.id, c.train_number, sr.code as source_code, dest.code as destination_code, ct.coach_code, r.type_code, b.date_of_journey, b.mobile_number from bookingdata b join
reservationtype r on r.id=b.fkreservation_type
join stations sr on sr.id = b.fksource_code
join stations brding on brding.id = b.fkboarding_at
join stations dest on dest.id = b.fkdestination_code
join coaches c on c.id = b.fktrain_number
join coachtype ct on ct.id = b.fkcoach_type where b.id= $1 and proceed_status=$2 for update`,
      [booking_id, false]
    );
    if (0 === booking_details.rows.length) {
      throw {
        status: 200,
        success: false,
        message: "Booking details not found!",
      };
    }
    //overall valiations
    switch (booking_details.rows[0].coach_code) {
      case "SL":
        booking_summary = await insertticketdata_sl(client, booking_id);
        break;
      case "1A":
        break;
      case "2A":
        booking_summary = await insertticketdata_2a(client, booking_id);
        break;
      case "3A":
        booking_summary = await insertticketdata_3a(client, booking_id);
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
module.exports = confirmBooking;
