const insertbookingdata_3a = require("./insertion/insertbookingdata_3a");
const checkSeats = require("./fetchers/checkSeats");
const validateDateOfJourney = require("../utils/validateDateOfJourney");
const insertbookingdata_2s = require("./insertion/insertbookingdata_2s");
const insertbookingdata_cc = require("./insertion/insertbookingdata_cc");
const insertbookingdata_ec = require("./insertion/insertbookingdata_ec");
const insertbookingdata_ea = require("./insertion/insertbookingdata_ea");
const insertbookingdata_e3 = require("./insertion/insertbookingdata_e3");
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
      return {
        statuscode: 422,
        successstatus: false,
        message:
          "Ladies quota must be female passengers and maximum 2 female passengers!",
      };
    }
    if (
      booking_details.reservation_type == "PWD" &&
      1 != booking_details.passenger_details.length
    ) {
      return {
        statuscode: 422,
        successstatus: false,
        message: "PWD booking can be done only for 1 person!",
      };
    }
    const result_train_number = await client.query(
      `select id from coaches where train_number = $1`,
      [booking_details.train_number]
    );
    if (0 === result_train_number.rows.length) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Selected train number ${booking_details.train_number} not found!`,
      };
    }
    const result_reservation_type = await client.query(
      `select id from reservationtype where type_code = $1`,
      [booking_details.reservation_type.toUpperCase()]
    );
    if (0 === result_reservation_type.rows.length) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Selected reservation type ${booking_details.reservation_type} not found!`,
      };
    }
    //check coach_type
    const result_coach_type = await client.query(
      `select id from coachtype where coach_code = $1`,
      [booking_details.coach_type.toUpperCase()]
    );
    if (0 === result_coach_type.rows.length) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Selected coach type ${booking_details.coach_code} not found!`,
      };
    }
    const result_src = await client.query(
      `select id from stations where code = $1`,
      [booking_details.source_code.toUpperCase()]
    );
    if (0 === result_src.rows.length) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Source not found!`,
      };
    }
    //doj present?
    if (!validateDateOfJourney(booking_details.doj)) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Invalid date of journey found!`,
      };
    }
    const result_dest = await client.query(
      `select id from stations where code = $1`,
      [booking_details.destination_code.toUpperCase()]
    );
    if (0 === result_dest.rows.length) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Destination ${booking_details.destination_code} not found!`,
      };
    }
    //boarding_at
    if (!booking_details.boarding_at) {
      booking_details.boarding_at = booking_details.source_code;
    }
    const result_brdingat = await client.query(
      `select id from stations where code = $1`,
      [booking_details.boarding_at.toUpperCase()]
    );
    if (0 === result_brdingat.rows.length) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Boarding point ${booking_details.boarding_at} not found!`,
      };
    }
    //check if boarding point is withing the train schedule
    const result_brding_point_withingschedule = await client.query(
      `select distinct s2.station_code from schedules s1 join
schedules s2 on s1.train_number = s2.train_number
where s1.station_code = $1 and s2.station_code = $2 and s1.station_sequence >=s2.station_sequence and s1.train_number= $3`,
      [
        booking_details.boarding_at.toUpperCase(),
        booking_details.source_code.toUpperCase(),
        booking_details.train_number,
      ]
    );
    const station_brding = result_brding_point_withingschedule.rows.filter(
      (x) =>
        x.station_code.toUpperCase() ===
        booking_details.boarding_at.toUpperCase()
    );
    if (
      0 === station_brding.length ||
      0 === result_brding_point_withingschedule.rows.length
    ) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Boaring point is not within your mentioned train schedule!`,
      };
    }
    //coachtype
    if (!booking_details.coach_type) {
      return {
        statuscode: 404,
        successstatus: false,
        message: `Coach type not found!`,
      };
    }
    let adult_count = booking_details.passenger_details.filter(
      (x) => x.passenger_ischild === false || x.passenger_issenior === true
    );
    let child_count = booking_details.passenger_details.filter(
      (x) => x.passenger_ischild === true
    );
    if (
      !booking_details.passenger_details ||
      (0 === adult_count.length && 0 === child_count.length)
    ) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Invalid passenger details found!`,
      };
    }
    //check seats
    const seats_check = await checkSeats(
      client,
      booking_details.train_number,
      booking_details.doj,
      booking_details.coach_type,
      booking_details.reservation_type
    );
    if (!seats_check) {
      return {
        statuscode: 422,
        successstatus: false,
        message: `Booking not allowed for coach ${booking_details.coach_type} for reservation ${booking_details.reservation_type}!`,
      };
    }
    //overall valiations
    await client.query("BEGIN");
    switch (booking_details.coach_type.toUpperCase()) {
      case "SL":
        booking_summary = await insertbookingdata_sl(
          client,
          booking_details,
          result_train_number,
          result_src,
          result_dest,
          result_reservation_type,
          result_coach_type,
          result_brdingat
        );
        break;
      case "1A":
        booking_summary = await insertbookingdata_1a(
          client,
          booking_details,
          result_train_number,
          result_src,
          result_dest,
          result_reservation_type,
          result_coach_type,
          result_brdingat
        );
        break;
      case "2A":
        booking_summary = await insertbookingdata_2a(
          client,
          booking_details,
          result_train_number,
          result_src,
          result_dest,
          result_reservation_type,
          result_coach_type,
          result_brdingat
        );
        break;
      case "3A":
        booking_summary = await insertbookingdata_3a(
          client,
          booking_details,
          result_train_number,
          result_src,
          result_dest,
          result_reservation_type,
          result_coach_type,
          result_brdingat
        );
        break;
      case "2S":
        booking_summary = await insertbookingdata_2s(
          client,
          booking_details,
          result_train_number,
          result_src,
          result_dest,
          result_reservation_type,
          result_coach_type,
          result_brdingat
        );
        break;
      case "CC":
        booking_summary = await insertbookingdata_cc(
          client,
          booking_details,
          result_train_number,
          result_src,
          result_dest,
          result_reservation_type,
          result_coach_type,
          result_brdingat
        );
        break;
      case "EC":
        booking_summary = await insertbookingdata_ec(
          client,
          booking_details,
          result_train_number,
          result_src,
          result_dest,
          result_reservation_type,
          result_coach_type,
          result_brdingat
        );
        break;
      case "EA":
        booking_summary = await insertbookingdata_ea(
          client,
          booking_details,
          result_train_number,
          result_src,
          result_dest,
          result_reservation_type,
          result_coach_type,
          result_brdingat
        );
        break;
      case "E3":
        booking_summary = await insertbookingdata_e3(
          client,
          booking_details,
          result_train_number,
          result_src,
          result_dest,
          result_reservation_type,
          result_coach_type,
          result_brdingat
        );
        break;
      case "FC":
        booking_summary = await insertbookingdata_fc(
          client,
          booking_details,
          result_train_number,
          result_src,
          result_dest,
          result_reservation_type,
          result_coach_type,
          result_brdingat
        );
        break;
      default:
        return {
          statuscode: 422,
          successstatus: false,
          message: "Invalid coach type for booking!",
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
where b.mobile_number = $1 and b.proceed_status=$2`,
      [booking_details.mobile_number, false]
    );
    booking_summary.booked_details = updated_booked_details.rows[0];
    await client.query("COMMIT");
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
module.exports = proceedBooking;
