const checkForValidDate = require("../../utils/checkForValidDate");
const replaceNulls = require("../../utils/replaceNulls");
const convertSearchTrainsToJson = require("../../utils/convertSearchTrainsToJson");

const searchTrainsBetweenSatations = async (
  client,
  source_code,
  destination_code,
  via_code
) => {
  let result_dest = [];
  let result_src = [];
  try {
    //check date
    if (!checkForValidDate(doj)) {
      throw {
        status: 200,
        success: false,
        message: `Invalid date selected!`,
        data: {},
      };
    }
    //src exists
    result_src = await client.query(`select *from stations where code = $1`, [
      source_code,
    ]);
    if (0 === result_src.rows.length) {
      throw {
        status: 200,
        success: false,
        message: `Source ${source_code} not found!`,
        data: {},
      };
    }
    //dest exists
    result_dest = await client.query(`select *from stations where code = $1`, [
      destination_code,
    ]);
    if (0 === result_dest.rows.length) {
      throw {
        status: 200,
        success: false,
        message: `Destination ${destination_code} not found!`,
        data: {},
      };
    }
    //via cod exists
    if (via_code) {
      result_dest = await client.query(
        `select *from stations where code = $1`,
        [via_code]
      );
      if (0 === result_dest.rows.length) {
        throw {
          status: 200,
          success: false,
          message: `In-between station mentioned was not found!`,
          data: {},
        };
      }
    }
    let search_train_details = await client.query(
      `WITH params AS (
    SELECT 
        $1::text AS source_code,        -- Source station
        $2::text AS destination_code,   -- Destination station
        $3::text AS via_station_code     -- Optional via station
),
trains_filtered AS (
    SELECT DISTINCT 
        t.train_number,
        t.train_name,
        t.train_type,
        t.station_from,
		p.via_station_code,
        t.station_to
    FROM trains t
    JOIN schedules r ON r.train_number = t.train_number
    JOIN params p ON TRUE
    WHERE r.station_code IN (p.source_code, p.destination_code)
)
SELECT DISTINCT
    tf.train_number,
    tf.train_name,
    tf.train_type,
    tf.station_from,	
    tf.station_to,
	s1.station_name as user_source,
	s2.station_name as user_destination,
	s3.station_name as user_via,
    -- ✅ User-entered stations
    p.source_code AS entered_source,
    p.destination_code AS entered_destination,
    p.via_station_code AS entered_via_station,
	
    s1.departure AS scheduled_departure,
    s2.arrival AS estimated_arrival,
    (s2.kilometer - s1.kilometer) AS distance_km,

    -- 💰 Fares: only show if that coach type exists in 'coaches' table (Y)
    COALESCE(
        CASE 
            WHEN c.sl = 'Y' AND ct_sl.fare_multiplier IS NOT NULL
                THEN ROUND((s2.kilometer - s1.kilometer) * ct_sl.fare_multiplier)
            ELSE NULL
        END::text, '-') AS fare_sl,

    COALESCE(
        CASE 
            WHEN c.a_3 = 'Y' AND ct_3a.fare_multiplier IS NOT NULL
                THEN ROUND((s2.kilometer - s1.kilometer) * ct_3a.fare_multiplier)
            ELSE NULL
        END::text, '-') AS fare_3a,

    COALESCE(
        CASE 
            WHEN c.a_2 = 'Y' AND ct_2a.fare_multiplier IS NOT NULL
                THEN ROUND((s2.kilometer - s1.kilometer) * ct_2a.fare_multiplier)
            ELSE NULL
        END::text, '-') AS fare_2a,

    COALESCE(
        CASE 
            WHEN c.cc = 'Y' AND ct_cc.fare_multiplier IS NOT NULL
                THEN ROUND((s2.kilometer - s1.kilometer) * ct_cc.fare_multiplier)
            ELSE NULL
        END::text, '-') AS fare_cc,

    COALESCE(
        CASE 
            WHEN c.ec = 'Y' AND ct_ec.fare_multiplier IS NOT NULL
                THEN ROUND((s2.kilometer - s1.kilometer) * ct_ec.fare_multiplier)
            ELSE NULL
        END::text, '-') AS fare_ec,

    COALESCE(
        CASE 
            WHEN c.ea = 'Y' AND ct_ea.fare_multiplier IS NOT NULL
                THEN ROUND((s2.kilometer - s1.kilometer) * ct_ea.fare_multiplier)
            ELSE NULL
        END::text, '-') AS fare_ea,

    COALESCE(
        CASE 
            WHEN c.e_3 = 'Y' AND ct_e3.fare_multiplier IS NOT NULL
                THEN ROUND((s2.kilometer - s1.kilometer) * ct_e3.fare_multiplier)
            ELSE NULL
        END::text, '-') AS fare_e3

FROM trains_filtered tf
JOIN params p ON TRUE
LEFT JOIN schedules s1 
       ON s1.train_number = tf.train_number 
      AND s1.station_code = p.source_code
LEFT JOIN schedules s2 
       ON s2.train_number = tf.train_number 
      AND s2.station_code = p.destination_code
LEFT JOIN schedules s3 
       ON s3.train_number = tf.train_number
      AND (
          p.via_station_code IS not NULL
          and s3.station_code = p.via_station_code
      )
-- 🧩 Join to coaches table to check which coach exists
LEFT JOIN coaches c 
       ON c.train_number = tf.train_number

-- 🧮 Join to coachtype for fare multipliers
LEFT JOIN coachtype ct_sl ON ct_sl.coach_code = 'SL'
LEFT JOIN coachtype ct_3a ON ct_3a.coach_code = '3A'
LEFT JOIN coachtype ct_2a ON ct_2a.coach_code = '2A'
LEFT JOIN coachtype ct_cc ON ct_cc.coach_code = 'CC'
LEFT JOIN coachtype ct_ec ON ct_ec.coach_code = 'EC'
LEFT JOIN coachtype ct_ea ON ct_ea.coach_code = 'EA'
LEFT JOIN coachtype ct_e3 ON ct_e3.coach_code = 'E3'

WHERE s1.station_sequence < s2.station_sequence 
AND (
        c.sl = 'Y' OR 
        c.a_1 = 'Y' OR 
        c.a_2 = 'Y' OR 
		c.a_3 = 'Y' OR 
        c.cc = 'Y' OR 
        c.ec = 'Y' OR 
        c.ea = 'Y' OR 
        c.e_3 = 'Y'
    )
ORDER BY s1.departure, tf.train_number;
`,
      [source_code, destination_code, via_code]
    );
    //if via_station name is null that means train goes between mentioned first & last stations but via station it will not go.
    const cleanedResult = replaceNulls(search_train_details.rows);
    return {
      source: result_src.rows[0].station_name,
      source_code: result_src.rows[0].code,
      destination: result_dest.rows[0].station_name,
      destination_code: result_dest.rows[0].code,
      date_of_journey: doj,
      trains_list: cleanedResult,
    };
  } catch (err) {
    throw err;
  } finally {
  }
};
module.exports = searchTrainsBetweenSatations;
