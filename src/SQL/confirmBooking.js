const insertticketdata_sl = require("./insertion/insertticketdata_sl");
const insertticketdata_2s = require("./insertion/insertticketdata_2s");
const insertticketdata_cc = require("./insertion/insertticketdata_cc");
const insertticketdata_ec = require("./insertion/insertticketdata_ec");
const insertticketdata_e3 = require("./insertion/insertticketdata_e3");
const insertticketdata_ea = require("./insertion/insertticketdata_ea");
const insertticketdata_2a = require("./insertion/insertticketdata_2a");
const insertticketdata_3a = require("./insertion/insertticketdata_3a");
const insertticketdata_1a = require("./insertion/insertticketdata_1a");
const insertticketdata_fc = require("./insertion/insertticketdata_fc");
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
join coachtype ct on ct.id = b.fkcoach_type where b.id= $1 and b.proceed_status=$2 for update`,
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
        booking_summary = await insertticketdata_1a(client, booking_id);
        break;
      case "2A":
        booking_summary = await insertticketdata_2a(client, booking_id);
        break;
      case "3A":
        booking_summary = await insertticketdata_3a(client, booking_id);
        break;
      case "2S":
        booking_summary = await insertticketdata_2s(client, booking_id);
        break;
      case "CC":
        booking_summary = await insertticketdata_cc(client, booking_id);
        break;
      case "EC":
        booking_summary = await insertticketdata_ec(client, booking_id);
        break;
      case "EA":
        booking_summary = await insertticketdata_ea(client, booking_id);
        break;
      case "E3":
        booking_summary = await insertticketdata_e3(client, booking_id);
        break;
      case "FC":
        booking_summary = await insertticketdata_fc(client, booking_id);
        break;
      default:
        throw {
          status: 401,
          success: false,
          message: "Invalid coach type for booking!",
          data: {},
        };
    }
    const updated_booked_details = await await client.query(
      `select b.*, t.train_number as train_number, c.coach_code, r.type_code, src.code as source_code, src.station_name as source_name, dest.code as destination_code, dest.station_name as destination_name
      , brding.code as boarding_point, brding.station_name as boarding_point_name from bookingdata b
left join coaches t on t.id = b.fktrain_number
left join coachtype c on c.id = b.fkcoach_type
left join reservationtype r on r.id = b.fkreservation_type
left join stations src on src.id = b.fksource_code
left join stations dest on dest.id = b.fkdestination_code
left join stations brding on brding.id = b.fkboarding_at
where b.id = $1`,
      [booking_id]
    );
    booking_summary.result_updated_bookingdetails =
      updated_booked_details.rows[0];
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
