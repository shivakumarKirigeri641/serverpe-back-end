const getRandomDateNext60Days = require("../../../utils/reservation_simulator_helpers/getRandomDateNext60Days");
const checkIfDateIsTomorrow = require("../../../utils/reservation_simulator_helpers/checkIfDateIsTomorrow");
const fs = require("fs").promises;
const path = require("path");
const proceedBooking = require("../../proceedBooking");
const confirmBooking = require("../../confirmBooking");
const getRandomPassengers = require("../../../utils/reservation_simulator_helpers/getRandomPassengers");
const getRandomMobileNumber = require("../../../utils/reservation_simulator_helpers/getRandomMobileNumber");
const getSourceAndDestination = require("../../../SQL/reservation_simulator_sql_helpers/getSourceAndDestination");
const runSimulator_ea = async (pool) => {
  const train_numbers_ea = await pool.query(
    `SELECT train_number, date_of_journey
FROM (
  SELECT DISTINCT train_number, date_of_journey
  FROM seatsondate_ea where date_of_journey >= (CURRENT_DATE + INTERVAL '1 day')
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
    pool,
    train_numbers_ea.rows[0].train_number
  );
  let mobilenumber = getRandomMobileNumber();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Convert both to YYYY-MM-DD strings for comparison
  const formatDate = (d) => d.toISOString().split("T")[0];
  const dojDate = new Date(train_numbers_ea.rows[0].date_of_journey);

  if (formatDate(dojDate) === formatDate(tomorrow)) {
    // ✅ If journey date is tomorrow, force TTL or PTL
    const SPECIAL = ["TTL", "PTL", "GEN"];
    random_reservation_type =
      SPECIAL[Math.floor(Math.random() * SPECIAL.length)];
  }
  const body = {
    train_number: train_numbers_ea.rows[0].train_number,
    doj: train_numbers_ea.rows[0].date_of_journey,
    coach_type: "EA",
    source_code: source_code,
    destination_code: destination_code,
    mobile_number: mobilenumber,
    reservation_type: random_reservation_type,
    passenger_details: getRandomPassengers(random_reservation_type),
  };
  try {
    // Booking summary
    booking_summary = await proceedBooking(pool, body);

    // Confirm ticket
    confirmed_ticket = await confirmBooking(
      pool,
      booking_summary.booked_details.id
    );
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
  }
};
module.exports = runSimulator_ea;
