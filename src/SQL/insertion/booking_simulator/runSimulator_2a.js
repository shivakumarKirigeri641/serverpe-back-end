const getRandomDateNext60Days = require("../../../utils/reservation_simulator_helpers/getRandomDateNext60Days");
const checkIfDateIsTomorrow = require("../../../utils/reservation_simulator_helpers/checkIfDateIsTomorrow");
const fs = require("fs").promises;
const path = require("path");
const proceedBooking = require("../../proceedBooking");
const confirmBooking = require("../../confirmBooking");
const getRandomPassengers = require("../../../utils/reservation_simulator_helpers/getRandomPassengers");
const getRandomMobileNumber = require("../../../utils/reservation_simulator_helpers/getRandomMobileNumber");
const getSourceAndDestination = require("../../../SQL/reservation_simulator_sql_helpers/getSourceAndDestination");
const runSimulator_2a = async (pool, client) => {
  const train_numbers_2a = await client.query(
    `SELECT train_number, date_of_journey
FROM (
  SELECT DISTINCT train_number, date_of_journey
  FROM seatsondate_2a
) AS distinct_data
ORDER BY RANDOM()
LIMIT 1;
`
  );
  const random_date = getRandomDateNext60Days();
  let random_reservation_type = "GEN";
  //get booking details similar to req.body
  const { source_code, destination_code } = await getSourceAndDestination(
    client,
    train_numbers_2a.rows[0].train_number
  );
  let mobilenumber = getRandomMobileNumber();
  const body = {
    train_number: train_numbers_2a.rows[0].train_number,
    doj: train_numbers_2a.rows[0].date_of_journey,
    coach_type: "2a",
    source_code: source_code,
    destination_code: destination_code,
    mobile_number: mobilenumber,
    reservation_type: random_reservation_type,
    passenger_details: getRandomPassengers(random_reservation_type),
  };
  try {
    // Booking summary
    const client1 = await pool.connect();
    booking_summary = await proceedBooking(client1, body);

    // Confirm ticket
    const client2 = await pool.connect();
    confirmed_ticket = await confirmBooking(
      client2,
      booking_summary.booked_details.id
    );
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    console.log(`Booking done:(2a)${new Date()}`);
  }
};
module.exports = runSimulator_2a;
