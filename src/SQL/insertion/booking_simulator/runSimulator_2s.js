const getRandomDateNext60Days = require("../../../utils/reservation_simulator_helpers/getRandomDateNext60Days");
const checkIfDateIsTomorrow = require("../../../utils/reservation_simulator_helpers/checkIfDateIsTomorrow");
const fs = require("fs").promises;
const path = require("path");
const proceedBooking = require("../../proceedBooking");
const confirmBooking = require("../../confirmBooking");
const getRandomPassengers = require("../../../utils/reservation_simulator_helpers/getRandomPassengers");
const getRandomMobileNumber = require("../../../utils/reservation_simulator_helpers/getRandomMobileNumber");
const getSourceAndDestination = require("../../../SQL/reservation_simulator_sql_helpers/getSourceAndDestination");
const runSimulator_2s = async (pool) => {
  const client = await pool.connect();
  const train_numbers_2s = await client.query(
    `SELECT train_number, date_of_journey
FROM (
  SELECT DISTINCT train_number, date_of_journey
  FROM seatsondate_2s
) AS distinct_data
ORDER BY RANDOM()
LIMIT 1;
`
  );
  const random_date = getRandomDateNext60Days();
  const ARRAY = ["GEN", "LADIES", "SENIOR"];
  let random_reservation_type = ARRAY[Math.floor(Math.random() * ARRAY.length)];
  //get booking details similar to req.body
  const { source_code, destination_code } = await getSourceAndDestination(
    client,
    train_numbers_2s.rows[0].train_number
  );
  let mobilenumber = getRandomMobileNumber();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Convert both to YYYY-MM-DD strings for comparison
  const formatDate = (d) => d.toISOString().split("T")[0];
  const dojDate = new Date(train_numbers_2s.rows[0].date_of_journey);

  if (formatDate(dojDate) === formatDate(tomorrow)) {
    // ✅ If journey date is tomorrow, force TTL or PTL
    const SPECIAL = ["TTL", "PTL"];
    random_reservation_type =
      SPECIAL[Math.floor(Math.random() * SPECIAL.length)];
  }
  const body = {
    train_number: train_numbers_2s.rows[0].train_number,
    doj: train_numbers_2s.rows[0].date_of_journey,
    coach_type: "2S",
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
    await client.release();
  }
};
module.exports = runSimulator_2s;
