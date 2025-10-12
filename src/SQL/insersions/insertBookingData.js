const insertBookingData = async (
  client,
  train_number,
  src,
  dest,
  boarding_at,
  doj,
  adultcount,
  childcount,
  reservation_type,
  coach_type,
  mobile_number,
  passenger_details
) => {
  let result = null;
  try {
    result = await client.query(
      `insert into bookingdata (train_number, source_code, destination_code, boarding_at, mobile_number, date_of_journey, 
      adult_count, child_count, reservation_type, coach_type) values ($1,$2,$3,$4, $5,$6,$7, $8, $9,$10) returning *`,
      [
        train_number,
        src,
        dest,
        boarding_at,
        mobile_number,
        doj,
        adultcount,
        childcount,
        reservation_type,
        coach_type,
      ]
    );
    return result;
  } catch (err) {
    throw err;
  }
};
module.exports = insertBookingData;
