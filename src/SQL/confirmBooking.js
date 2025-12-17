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
const getFareDetails = require("./fetchers/getFareDetails");
const sendMockTicketSMS = require("./reservations/sendMockTicketSMS");
const confirmBooking = async (
  client,
  booking_id,
  can_send_mock_ticket_sms = false
) => {
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
      return {
        statuscode: 422,
        successstatus: false,
        message:
          "booking details not found! Please run the end-point 'Proceed_booking' before running this end-point.",
      };
    }
    //overall valiations
    const train_details = await client.query(
      `select *from trains where train_number = $1`,
      [booking_details.rows[0].train_number]
    );
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
        return {
          statuscode: 422,
          successstatus: false,
          message: "Invalid coach type for booking!",
        };
    }
    const updated_booked_details = await await client.query(
      `SELECT distinct
    b.*,
    t.train_number,
	tr.train_name,
    c.coach_code,
    r.type_code,
    src.code AS source_code,
    src.station_name AS source_name,
    dest.code AS destination_code,
    dest.station_name AS destination_name,
    sch_src.departure AS scheduled_departure,
    sch_dest.arrival AS estimated_arrival,
    brding.code AS boarding_point,
    brding.station_name AS boarding_point_name
FROM bookingdata b
LEFT JOIN coaches t 
    ON t.id = b.fktrain_number
LEFT JOIN trains tr 
    ON tr.train_number = t.train_number
LEFT JOIN coachtype c 
    ON c.id = b.fkcoach_type
LEFT JOIN reservationtype r 
    ON r.id = b.fkreservation_type
LEFT JOIN stations src 
    ON src.id = b.fksource_code
LEFT JOIN stations dest 
    ON dest.id = b.fkdestination_code
LEFT JOIN stations brding 
    ON brding.id = b.fkboarding_at

-- **Fast schedule lookup without subquery**
LEFT JOIN schedules sch_src 
    ON sch_src.train_number = t.train_number
   AND sch_src.station_code = src.code

LEFT JOIN schedules sch_dest 
    ON sch_dest.train_number = t.train_number
   AND sch_dest.station_code = dest.code

WHERE b.id = $1;
`,
      [booking_id]
    );
    booking_summary.result_updated_bookingdetails =
      updated_booked_details.rows[0];
    const temp_fare_details = await getFareDetails(
      client,
      booking_summary.result_updated_bookingdetails,
      null,
      booking_summary.result_udpated_passengerdetails
    );
    booking_summary.fare_details = temp_fare_details;
    await client.query("COMMIT");
    //send mock sms if enabled
    if (can_send_mock_ticket_sms === true) {
      /*sendMockTicketSMS(
        booking_details.rows[0].mobile_number,
        updated_booked_details.rows[0].pnr,
        booking_details.rows[0].train_number,
        train_details.rows[0].train_name,
        updated_booked_details.rows[0].scheduled_departure
      );*/
    }
    return booking_summary;
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    return {
      statuscode: 500,
      successstatus: false,
      message: err.message,
    };
  }
};
module.exports = confirmBooking;
