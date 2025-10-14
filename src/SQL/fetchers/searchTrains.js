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
        $3::date AS start_date,   -- user-selected journey date
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
    d.date_of_journey,

    -- SL seats (NULL if no SL coach)
    CASE WHEN EXISTS (SELECT 1 FROM coaches c2 WHERE c2.train_number = t.train_number AND c2.sl = 'Y')
         THEN COALESCE(sl.available_seats, 0)
         ELSE NULL
    END AS sl_available_seats,

    -- 3A seats (NULL if no 3A coach)
    CASE WHEN EXISTS (SELECT 1 FROM coaches c3 WHERE c3.train_number = t.train_number AND c3.a_3 = 'Y')
         THEN COALESCE(a3.available_seats, 0)
         ELSE NULL
    END AS a3_available_seats

FROM trains t
JOIN coaches c ON c.train_number = t.train_number
JOIN schedules s1 ON s1.train_number = t.train_number
JOIN schedules s2 ON s2.train_number = t.train_number
JOIN stations st1 ON st1.code = s1.station_code
JOIN stations st2 ON st2.code = s2.station_code
CROSS JOIN params p
CROSS JOIN LATERAL (
    SELECT generate_series(p.start_date, p.start_date + INTERVAL '7 day', '1 day')::date AS date_of_journey
) d
LEFT JOIN seatsondate_sl_summary sl 
    ON sl.train_number = t.train_number 
   AND sl.date_of_journey = d.date_of_journey
LEFT JOIN seatsondate_3a_summary a3
    ON a3.train_number = t.train_number 
   AND a3.date_of_journey = d.date_of_journey

WHERE s1.station_code = $1
  AND s2.station_code = $2
  AND s1.station_sequence < s2.station_sequence
  AND (
      d.date_of_journey > p.today 
      OR (
          d.date_of_journey = p.today 
          AND (p.now_ist + INTERVAL '4 hour') < (d.date_of_journey + s1.departure::time)
      )
  )
  AND (
        (EXTRACT(DOW FROM d.date_of_journey) = 0 AND t.train_runs_on_sun = 'Y') OR
        (EXTRACT(DOW FROM d.date_of_journey) = 1 AND t.train_runs_on_mon = 'Y') OR
        (EXTRACT(DOW FROM d.date_of_journey) = 2 AND t.train_runs_on_tue = 'Y') OR
        (EXTRACT(DOW FROM d.date_of_journey) = 3 AND t.train_runs_on_wed = 'Y') OR
        (EXTRACT(DOW FROM d.date_of_journey) = 4 AND t.train_runs_on_thu = 'Y') OR
        (EXTRACT(DOW FROM d.date_of_journey) = 5 AND t.train_runs_on_fri = 'Y') OR
        (EXTRACT(DOW FROM d.date_of_journey) = 6 AND t.train_runs_on_sat = 'Y')
  )
ORDER BY d.date_of_journey, t.train_number, s1.departure;`,
      [source_code, destination_code, doj]
    );
    return search_train_details.rows;
  } catch (err) {
    throw err;
  } finally {
  }
};
module.exports = searchTrains;
