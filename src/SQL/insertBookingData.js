const insertBookingData = async (
  client,
  train_number,
  src,
  dest,
  boarding_at,
  doj,
  adultcount,
  childcount
) => {
  let result = null;
  try {
    result = await client.query(
      "insert into bookingdata (train_number, source_code, destination_code, boarding_at, date_of_journey, adult_count, child_count) values ($1,$2,$3,$4, $5,$6,$7) returning *",
      [train_number, src, dest, boarding_at, doj, adultcount, childcount]
    );
    return result;
  } catch (err) {
    throw err;
  }
};
module.exports = insertBookingData;
