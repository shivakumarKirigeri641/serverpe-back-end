const getReservedTrains = async (
  client,
  source_code,
  destination_code,
  date_of_journey
) => {
  try {
    result = await client.query(
      `WITH params AS (
  SELECT 
    $3::date AS start_date,  -- 👈 user-provided journey start date
    CURRENT_DATE AS today,
    CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata' AS now_ist
)
SELECT DISTINCT 
    t.train_number, 
    t.train_type, 
    t.train_name, 
    t.station_from AS train_origin, 
    t.station_to AS train_destination,
    s1.station_code AS passenger_source, 
    s2.station_code AS passenger_destination, 
    s1.station_name AS source, 
    s2.station_name AS destination, 
    s1.departure AS scheduled_departure, 
    s2.arrival AS estimated_destination_arrival, 
    (s2.kilometer - s1.kilometer) AS distance, 
    s.*
FROM seatsondate s
JOIN coaches c ON s.train_number = c.train_number
JOIN trains t ON t.train_number = c.train_number
JOIN schedules s1 ON s1.train_number = c.train_number
JOIN schedules s2 ON s2.train_number = c.train_number
JOIN stations st1 ON st1.code = s1.station_code
CROSS JOIN params p
JOIN stations st2 ON st2.code = s2.station_code
WHERE s1.station_code = $1
  AND s2.station_code = $2
  AND s1.station_sequence < s2.station_sequence
  AND s.date_of_journey BETWEEN p.start_date AND p.start_date + INTERVAL '6 day'  -- 👈 next 7 days
  AND (
        s.date_of_journey > p.today 
        OR (
            s.date_of_journey = p.today 
            AND (p.now_ist + INTERVAL '4 hour') < (s1.departure + s.date_of_journey)
        )
      )
ORDER BY s.date_of_journey, s1.departure;`,
      [
        source_code.toUpperCase(),
        destination_code.toUpperCase(),
        date_of_journey,
      ]
    );
    return result;
  } catch (err) {
    throw {
      success: false,
      message: "Failed to fetch station details!",
      data: err.message,
    };
  }
};
module.exports = getReservedTrains;
