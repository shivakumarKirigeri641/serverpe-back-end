const insertbookingdata_sl = async (client, booking_details) => {
  let booked_details = null;
  let passenger_details = [];
  try {
    //check train
    const result_train_number = await client.query(
      `select id from coaches where train_number = $1`,
      [booking_details.train_number]
    );
    if (0 === result_train_number.rows.length) {
      throw {
        status: 400,
        message: `Selected train number ${booking_details.train_number} not found!`,
        data: {},
      };
    }
    //check res_type
    const result_reservation_type = await client.query(
      `select id from reservationtype where type_code = $1`,
      [booking_details.reservation_type]
    );
    if (0 === result_reservation_type.rows.length) {
      throw {
        status: 400,
        message: `Selected reservation type ${booking_details.reservation_type} not found!`,
        data: {},
      };
    }
    //check coach_type
    const result_coach_type = await client.query(
      `select id from coachtype where coach_code = $1`,
      [booking_details.coach_code]
    );
    if (0 === result_coach_type.rows.length) {
      throw {
        status: 400,
        message: `Selected coach type ${booking_details.coach_code} not found!`,
        data: {},
      };
    }
    //src exists
    const result_src = await client.query(
      `select id from stations where code = $1`,
      [booking_details.source_code]
    );
    if (0 === result_src.rows.length) {
      throw {
        status: 400,
        message: `Source ${search_details.source_code} not found!`,
        data: {},
      };
    }
    //dest exists
    const result_dest = await client.query(
      `select id from stations where code = $1`,
      [booking_details.destination_code]
    );
    if (0 === result_dest.rows.length) {
      throw {
        status: 400,
        message: `Desination ${search_details.destination_code} not found!`,
        data: {},
      };
    }
    //boarding_at
    const result_brdingat = await client.query(
      `select id from stations where code = $1`,
      [booking_details.boarding_at]
    );
    if (0 === result_brdingat.rows.length) {
      throw {
        status: 400,
        message: `Boarding point ${search_details.boarding_at} not found!`,
        data: {},
      };
    }
    if (!booking_details.passenger_details) {
      throw {
        status: 400,
        message: `Passenger list found!`,
        data: {},
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
      throw {
        status: 400,
        message: `Invalid passenger details found!`,
        data: {},
      };
    }
    booked_details = await client.query(
      `insert into bookingdata (train_number, date_of_journey, source_code, desination_code, reservation_type, coach_type, mobile_number, adult_count, child_count) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        booking_details.train_number,
        booking_details.date_of_journey,
        booking_details.source_code,
        booking_details.desination_code,
        result_reservation_type.rows[0].id,
        result_coach_type.rows[0].id,
        booking_details.mobile_number,
        booking_details.adult_count,
        booking_details.child_count,
      ]
    );
    //insert passenger list
    return {
      booked_details: booked_details.rows[0],
      passenger_details: passenger_details,
    };
  } catch (err) {
    throw err;
  }
};
module.exports = insertbookingdata_sl;
