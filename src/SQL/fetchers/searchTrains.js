const convertSearchTrainsToJson = require("../../utils/convertSearchTrainsToJson");

const searchTrains = async (client, source_code, destination_code, doj) => {
  let search_train_details = null;
  try {
    //src exists
    const result_src = await client.query(
      `select id from stations where code = $1`,
      [source_code]
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
      [destination_code]
    );
    if (0 === result_dest.rows.length) {
      throw {
        status: 400,
        message: `Source ${search_details.destination_code} not found!`,
        data: {},
      };
    }
    search_train_details = await client.query(
      `WITH params AS (
    SELECT 
        $3::date AS journey_date,       -- user-selected journey date
        $1::text AS source_code,              -- source station code
        $2::text AS destination_code,         -- destination station code
        CURRENT_DATE AS today,
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata' AS now_ist
)
SELECT 
    t.train_number,
    t.train_name,
    t.train_type,
    t.station_from AS train_origin,
    t.station_to AS train_destination,
    s1.departure AS scheduled_departure,
    s2.arrival AS estimated_destination_arrival,
    (s2.kilometer - s1.kilometer) AS distance,
    p.journey_date,

    -- SL seats by reservation type
    MAX(CASE WHEN ss_sl.fk_reservation_type = 1 THEN ss_sl.available_seats END) AS sl_gen,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 3 THEN ss_sl.available_seats END) AS sl_ttl,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 4 THEN ss_sl.available_seats END) AS sl_ptl,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 5 THEN ss_sl.available_seats END) AS sl_ladies,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 6 THEN ss_sl.available_seats END) AS sl_pwd,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 7 THEN ss_sl.available_seats END) AS sl_rac,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 8 THEN ss_sl.available_seats END) AS sl_duty,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 9 THEN ss_sl.available_seats END) AS sl_senior,

    -- 3A seats by reservation type
    MAX(CASE WHEN ss_a3.fk_reservation_type = 1 THEN ss_a3.available_seats END) AS a3_gen,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 3 THEN ss_a3.available_seats END) AS a3_ttl,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 4 THEN ss_a3.available_seats END) AS a3_ptl,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 5 THEN ss_a3.available_seats END) AS a3_ladies,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 6 THEN ss_a3.available_seats END) AS a3_pwd,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 7 THEN ss_a3.available_seats END) AS a3_rac,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 8 THEN ss_a3.available_seats END) AS a3_duty,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 9 THEN ss_a3.available_seats END) AS a3_senior,

    -- Waiting lists
    MAX(wl_sl.waiting_count) AS sl_waiting,
    MAX(wl_a3.waiting_count) AS a3_waiting

FROM trains t
CROSS JOIN params p    -- important: makes p.* available
JOIN schedules s1 
    ON s1.train_number = t.train_number 
   AND s1.station_code = p.source_code
JOIN schedules s2 
    ON s2.train_number = t.train_number 
   AND s2.station_code = p.destination_code

LEFT JOIN seatsondate_sl_summary ss_sl 
       ON ss_sl.train_number = t.train_number 
      AND ss_sl.date_of_journey = p.journey_date
LEFT JOIN seatsondate_3a_summary ss_a3 
       ON ss_a3.train_number = t.train_number 
      AND ss_a3.date_of_journey = p.journey_date
LEFT JOIN waitinglist_sl_summary wl_sl
       ON wl_sl.train_number = t.train_number 
      AND wl_sl.date_of_journey = p.journey_date
LEFT JOIN waitinglist_a3_summary wl_a3
       ON wl_a3.train_number = t.train_number 
      AND wl_a3.date_of_journey = p.journey_date

WHERE s1.station_sequence < s2.station_sequence
  AND (
        (EXTRACT(DOW FROM p.journey_date) = 0 AND t.train_runs_on_sun = 'Y') OR
        (EXTRACT(DOW FROM p.journey_date) = 1 AND t.train_runs_on_mon = 'Y') OR
        (EXTRACT(DOW FROM p.journey_date) = 2 AND t.train_runs_on_tue = 'Y') OR
        (EXTRACT(DOW FROM p.journey_date) = 3 AND t.train_runs_on_wed = 'Y') OR
        (EXTRACT(DOW FROM p.journey_date) = 4 AND t.train_runs_on_thu = 'Y') OR
        (EXTRACT(DOW FROM p.journey_date) = 5 AND t.train_runs_on_fri = 'Y') OR
        (EXTRACT(DOW FROM p.journey_date) = 6 AND t.train_runs_on_sat = 'Y')
  )

GROUP BY t.train_number, t.train_name, t.train_type, t.station_from, t.station_to,
         s1.departure, s2.arrival, s2.kilometer, s1.kilometer, p.journey_date

ORDER BY p.journey_date, t.train_number, s1.departure;
`,
      [source_code, destination_code, doj]
    );
    //search_train_details = convertSearchTrainsToJson(result);
    return search_train_details;
  } catch (err) {
    throw err;
  } finally {
  }
};
module.exports = searchTrains;
