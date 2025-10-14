const insertbookingdata_sl = async (client, booking_details) => {
  let search_train_details = null;
  try {
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
    await client.query(
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
    return search_train_details;
  } catch (err) {
    throw err;
  }
};
module.exports = insertbookingdata_sl;
