const checkForValidDate = require("../../utils/checkForValidDate");
const replaceNulls = require("../../utils/replaceNulls");
const convertSearchTrainsToJson = require("../../utils/convertSearchTrainsToJson");

const searchTrains = async (client, source_code, destination_code, doj) => {
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
    let search_train_details = await client.query(
      `WITH params AS (
    SELECT 
        $3::date AS journey_date,
        $1::text AS source_code,
        $2::text AS destination_code,
        NULL::text AS coach_type,         -- NULL = all coaches, else specify 'SL', '3A', etc.
        NULL::text AS reservation_type,   -- NULL = default 'gen', else specify 'gen', 'ttl', 'ptl', etc.
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata' AS now_ist
),
trains_filtered AS (
    SELECT t.*
    FROM trains t
    JOIN schedules s1 ON s1.train_number = t.train_number AND s1.station_code = (SELECT source_code FROM params)
	JOIN coaches c on c.train_number = t.train_number
    JOIN schedules s2 ON s2.train_number = t.train_number AND s2.station_code = (SELECT destination_code FROM params)
    WHERE s1.station_sequence < s2.station_sequence
      AND (
          (EXTRACT(DOW FROM (SELECT journey_date FROM params)) = 0 AND t.train_runs_on_sun = 'Y') OR
          (EXTRACT(DOW FROM (SELECT journey_date FROM params)) = 1 AND t.train_runs_on_mon = 'Y') OR
          (EXTRACT(DOW FROM (SELECT journey_date FROM params)) = 2 AND t.train_runs_on_tue = 'Y') OR
          (EXTRACT(DOW FROM (SELECT journey_date FROM params)) = 3 AND t.train_runs_on_wed = 'Y') OR
          (EXTRACT(DOW FROM (SELECT journey_date FROM params)) = 4 AND t.train_runs_on_thu = 'Y') OR
          (EXTRACT(DOW FROM (SELECT journey_date FROM params)) = 5 AND t.train_runs_on_fri = 'Y') OR
          (EXTRACT(DOW FROM (SELECT journey_date FROM params)) = 6 AND t.train_runs_on_sat = 'Y')
      )
      AND (
          (SELECT journey_date FROM params) > CURRENT_DATE OR
          ((SELECT journey_date FROM params) = CURRENT_DATE AND ((SELECT now_ist FROM params) + INTERVAL '4 hour') < (s1.departure + (SELECT journey_date FROM params)::timestamp))
      )
      AND NOT (
          c.a_1 = 'N' AND c.a_2 = 'N' AND c.a_3 = 'N' AND c.sl = 'N' AND c.fc = 'N' AND c._2s = 'N' AND
          c.cc = 'N' AND c.ec = 'N' AND c.e_3 = 'N' AND c.ea = 'N' AND c.gen = 'Y'
      )
),
seat_summary AS (
    SELECT t.train_number,
        -- SL
        sl.gen_count::numeric  AS seat_count_gen_sl,
        sl.rac_count  AS seat_count_rac_sl,
        sl.rac_share_count AS seat_count_rac_share_sl,
        sl.ttl_count AS seat_count_ttl_sl,
        sl.ptl_count AS seat_count_ptl_sl,
        sl.ladies_count AS seat_count_ladies_sl,
        sl.pwd_count AS seat_count_pwd_sl,
        sl.duty_count AS seat_count_duty_sl,
        sl.senior_count AS seat_count_senior_sl,

        -- 3A
        a3.gen_count  AS seat_count_gen_3a,
        a3.rac_count  AS seat_count_rac_3a,
        a3.rac_share_count AS seat_count_rac_share_3a,
        a3.ttl_count AS seat_count_ttl_3a,
        a3.ptl_count AS seat_count_ptl_3a,
        a3.ladies_count AS seat_count_ladies_3a,
        a3.pwd_count AS seat_count_pwd_3a,
        a3.duty_count AS seat_count_duty_3a,
        a3.senior_count AS seat_count_senior_3a,

        -- 2A
        a2.gen_count AS seat_count_gen_2a,
        a2.rac_count AS seat_count_rac_2a,
        a2.ttl_count AS seat_count_ttl_2a,
        a2.ptl_count AS seat_count_ptl_2a,
		null as seat_count_ladies_2a,
		null as seat_count_pwd_2a,
		null as seat_count_senior_2a,

        -- 1A
        a1.gen_count AS seat_count_gen_1a,
		null  AS seat_count_rac_1a,
        null  AS seat_count_rac_share_1a,
        null  AS seat_count_ttl_1a,
        null  AS seat_count_ptl_1a,
        null  AS seat_count_ladies_1a,
        null  AS seat_count_pwd_1a,
        null  AS seat_count_duty_1a,
        null  AS seat_count_senior_1a,

        -- CC
        cc.gen_count AS seat_count_gen_cc,
        cc.ttl_count AS seat_count_ttl_cc,
        cc.ptl_count AS seat_count_ptl_cc,
		null AS seat_count_rac_cc,
		null AS seat_count_rac_shared_cc,
		null as seat_count_ladies_cc,		
        null AS seat_count_pwd_cc,
        null AS seat_count_duty_cc,
        null seat_count_senior_cc,

        -- EC
        ec.gen_count AS seat_count_gen_ec,
        ec.ttl_count AS seat_count_ttl_ec,
        ec.ptl_count AS seat_count_ptl_ec,
		null AS seat_count_rac_ec,
		null AS seat_count_rac_shared_ec,		
		null AS seat_count_ladies_ec,
		null AS seat_count_pwd_ec,
		null AS seat_count_senior_ec,

        -- EA
        ea.gen_count AS seat_count_gen_ea,
        ea.ttl_count AS seat_count_ttl_ea,
        ea.ptl_count AS seat_count_ptl_ea,
		null AS seat_count_ladies_ea,
		null AS seat_count_pwd_ea,
		null AS seat_count_senior_ea,

        -- E3
        e3.gen_count AS seat_count_gen_e3,
        e3.ttl_count AS seat_count_ttl_e3,
        e3.ptl_count AS seat_count_ptl_e3,
		null as seat_count_ladies_e3,
		null as seat_count_pwd_e3,
		null as seat_count_senior_e3,

        -- FC
        fc.gen_count AS seat_count_gen_fc,
		null as seat_count_ttl_fc,
		null as seat_count_ptl_fc,
		null as seat_count_ladies_fc,
		null as seat_count_pwd_fc,
		null as seat_count_senior_fc,
		null as seat_count_duty_fc,

        -- 2S
        s2.gen_count::numeric AS seat_count_gen_2s,
        s2.ttl_count::numeric AS seat_count_ttl_2s,
        s2.ptl_count::numeric AS seat_count_ptl_2s,
		null as seat_count_ladies_2s,
		null as seat_count_pwd_2s,
		null as seat_count_senior_2s

    FROM trains_filtered t
    LEFT JOIN (
        SELECT train_number,
               SUM(gen_count) AS gen_count,
               SUM(rac_count) AS rac_count,
               SUM(rac_share_count) AS rac_share_count,
               SUM(ttl_count) AS ttl_count,
               SUM(ptl_count) AS ptl_count,
               SUM(ladies_count) AS ladies_count,
               SUM(pwd_count) AS pwd_count,
               SUM(duty_count) AS duty_count,
               SUM(senior_count) AS senior_count
        FROM seatsondate_sl
        WHERE date_of_journey = (SELECT journey_date FROM params)
        GROUP BY train_number
    ) sl ON sl.train_number = t.train_number
    LEFT JOIN (
        SELECT train_number,
               SUM(gen_count) AS gen_count,
               SUM(rac_count) AS rac_count,
               SUM(rac_share_count) AS rac_share_count,
               SUM(ttl_count) AS ttl_count,
               SUM(ptl_count) AS ptl_count,
               SUM(ladies_count) AS ladies_count,
               SUM(pwd_count) AS pwd_count,
               SUM(duty_count) AS duty_count,
               SUM(senior_count) AS senior_count
        FROM seatsondate_3a
        WHERE date_of_journey = (SELECT journey_date FROM params)
        GROUP BY train_number
    ) a3 ON a3.train_number = t.train_number
    LEFT JOIN (
        SELECT train_number,
               SUM(gen_count) AS gen_count,
               SUM(rac_count) AS rac_count,
               SUM(ttl_count) AS ttl_count,
               SUM(ptl_count) AS ptl_count
        FROM seatsondate_2a
        WHERE date_of_journey = (SELECT journey_date FROM params)
        GROUP BY train_number
    ) a2 ON a2.train_number = t.train_number
    LEFT JOIN (
        SELECT train_number,
               SUM(gen_count) AS gen_count
        FROM seatsondate_1a
        WHERE date_of_journey = (SELECT journey_date FROM params)
        GROUP BY train_number
    ) a1 ON a1.train_number = t.train_number
    LEFT JOIN (
        SELECT train_number,
               SUM(gen_count) AS gen_count,
               SUM(ttl_count) AS ttl_count,
               SUM(ptl_count) AS ptl_count
        FROM seatsondate_cc
        WHERE date_of_journey = (SELECT journey_date FROM params)
        GROUP BY train_number
    ) cc ON cc.train_number = t.train_number
    LEFT JOIN (
        SELECT train_number,
               SUM(gen_count) AS gen_count,
               SUM(ttl_count) AS ttl_count,
               SUM(ptl_count) AS ptl_count
        FROM seatsondate_ec
        WHERE date_of_journey = (SELECT journey_date FROM params)
        GROUP BY train_number
    ) ec ON ec.train_number = t.train_number
    LEFT JOIN (
        SELECT train_number,
               SUM(gen_count) AS gen_count,
               SUM(ttl_count) AS ttl_count,
               SUM(ptl_count) AS ptl_count
        FROM seatsondate_ea
        WHERE date_of_journey = (SELECT journey_date FROM params)
        GROUP BY train_number
    ) ea ON ea.train_number = t.train_number
    LEFT JOIN (
        SELECT train_number,
               SUM(gen_count) AS gen_count,
               SUM(ttl_count) AS ttl_count,
               SUM(ptl_count) AS ptl_count
        FROM seatsondate_e3
        WHERE date_of_journey = (SELECT journey_date FROM params)
        GROUP BY train_number
    ) e3 ON e3.train_number = t.train_number
    LEFT JOIN (
        SELECT train_number,
               SUM(gen_count) AS gen_count
        FROM seatsondate_fc
        WHERE date_of_journey = (SELECT journey_date FROM params)
        GROUP BY train_number
    ) fc ON fc.train_number = t.train_number
    LEFT JOIN (
        SELECT train_number,
               SUM(gen_count) AS gen_count,
               SUM(ttl_count) AS ttl_count,
               SUM(ptl_count) AS ptl_count
        FROM seatsondate_2s
        WHERE date_of_journey = (SELECT journey_date FROM params)
        GROUP BY train_number
    ) s2 ON s2.train_number = t.train_number
)
SELECT distinct
    tf.train_number,
    tf.train_name,
    tf.train_type,
    tf.station_from,
    tf.station_to,
    s1.departure AS scheduled_departure,
    s2.arrival AS estimated_arrival,
	s2.running_day as running_day,
	(SELECT 
  CASE WHEN tf.train_runs_on_sun ILIKE 'Y' THEN 'S' ELSE '-' END || ' ' ||
  CASE WHEN tf.train_runs_on_mon ILIKE 'Y' THEN 'M' ELSE '-' END || ' ' ||
  CASE WHEN tf.train_runs_on_tue ILIKE 'Y' THEN 'T' ELSE '-' END || ' ' ||
  CASE WHEN tf.train_runs_on_wed ILIKE 'Y' THEN 'W' ELSE '-' END || ' ' ||
  CASE WHEN tf.train_runs_on_thu ILIKE 'Y' THEN 'T' ELSE '-' END || ' ' ||
  CASE WHEN tf.train_runs_on_fri ILIKE 'Y' THEN 'F' ELSE '-' END || ' ' ||
  CASE WHEN tf.train_runs_on_sat ILIKE 'Y' THEN 'S' ELSE '-' END)
AS running_days,
	(SELECT 
    FLOOR(EXTRACT(EPOCH FROM duration) / 3600) || ' hours ' || 
    FLOOR((EXTRACT(EPOCH FROM duration) % 3600) / 60) || ' minutes' AS duration_text
FROM (
    SELECT ((s2.arrival::time - s1.departure::time) + ((s2.running_day - 1) * INTERVAL '1 day')) AS duration
) sub) as journey_duration,
    (s2.kilometer - s1.kilometer) AS distance,

    ss.*,

    -- Fare calculations per coach
    -- SL
CASE WHEN ss.seat_count_gen_sl IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_sl.fare_multiplier ELSE NULL END AS fare_gen_sl,
CASE WHEN ss.seat_count_ttl_sl IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_sl.fare_multiplier + ct_sl.tatkal_charge_adder ELSE NULL END AS fare_ttl_sl,
CASE WHEN ss.seat_count_ptl_sl IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_sl.fare_multiplier + ct_sl.premium_tatkal_charge_adder ELSE NULL END AS fare_ptl_sl,
CASE WHEN ss.seat_count_pwd_sl IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_sl.fare_multiplier * ct_sl.concession_pwd ELSE NULL END AS fare_pwd_sl,
CASE WHEN ss.seat_count_senior_sl IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_sl.fare_multiplier * ct_sl.concession_senior ELSE NULL END AS fare_senior_sl,

-- 3A
CASE WHEN ss.seat_count_gen_3a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_3a.fare_multiplier ELSE NULL END AS fare_gen_3a,
CASE WHEN ss.seat_count_ttl_3a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_3a.fare_multiplier + ct_3a.tatkal_charge_adder ELSE NULL END AS fare_ttl_3a,
CASE WHEN ss.seat_count_ptl_3a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_3a.fare_multiplier + ct_3a.premium_tatkal_charge_adder ELSE NULL END AS fare_ptl_3a,
CASE WHEN ss.seat_count_pwd_3a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_3a.fare_multiplier * ct_3a.concession_pwd ELSE NULL END AS fare_pwd_3a,
CASE WHEN ss.seat_count_senior_3a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_3a.fare_multiplier * ct_3a.concession_senior ELSE NULL END AS fare_senior_3a,

-- 2A
CASE WHEN ss.seat_count_gen_2a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_2a.fare_multiplier ELSE NULL END AS fare_gen_2a,
CASE WHEN ss.seat_count_ttl_2a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_2a.fare_multiplier + ct_2a.tatkal_charge_adder ELSE NULL END AS fare_ttl_2a,
CASE WHEN ss.seat_count_ptl_2a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_2a.fare_multiplier + ct_2a.premium_tatkal_charge_adder ELSE NULL END AS fare_ptl_2a,
CASE WHEN ss.seat_count_pwd_2a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_2a.fare_multiplier * ct_2a.concession_pwd ELSE NULL END AS fare_pwd_2a,
CASE WHEN ss.seat_count_senior_2a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_2a.fare_multiplier * ct_2a.concession_senior ELSE NULL END AS fare_senior_2a,

-- 1A
CASE WHEN ss.seat_count_gen_1a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_1a.fare_multiplier ELSE NULL END AS fare_gen_1a,
CASE WHEN ss.seat_count_ttl_1a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_1a.fare_multiplier + ct_1a.tatkal_charge_adder ELSE NULL END AS fare_ttl_1a,
CASE WHEN ss.seat_count_ptl_1a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_1a.fare_multiplier + ct_1a.premium_tatkal_charge_adder ELSE NULL END AS fare_ptl_1a,
CASE WHEN ss.seat_count_pwd_1a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_1a.fare_multiplier * ct_1a.concession_pwd ELSE NULL END AS fare_pwd_1a,
CASE WHEN ss.seat_count_senior_1a IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_1a.fare_multiplier * ct_1a.concession_senior ELSE NULL END AS fare_senior_1a,

-- CC
CASE WHEN ss.seat_count_gen_cc IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_cc.fare_multiplier ELSE NULL END AS fare_gen_cc,
CASE WHEN ss.seat_count_ttl_cc IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_cc.fare_multiplier + ct_cc.tatkal_charge_adder ELSE NULL END AS fare_ttl_cc,
CASE WHEN ss.seat_count_ptl_cc IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_cc.fare_multiplier + ct_cc.premium_tatkal_charge_adder ELSE NULL END AS fare_ptl_cc,
CASE WHEN ss.seat_count_pwd_cc IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_cc.fare_multiplier * ct_cc.concession_pwd ELSE NULL END AS fare_pwd_cc,
CASE WHEN ss.seat_count_senior_cc IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_cc.fare_multiplier * ct_cc.concession_senior ELSE NULL END AS fare_senior_cc,

-- EC
CASE WHEN ss.seat_count_gen_ec IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_ec.fare_multiplier ELSE NULL END AS fare_gen_ec,
CASE WHEN ss.seat_count_ttl_ec IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_ec.fare_multiplier + ct_ec.tatkal_charge_adder ELSE NULL END AS fare_ttl_ec,
CASE WHEN ss.seat_count_ptl_ec IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_ec.fare_multiplier + ct_ec.premium_tatkal_charge_adder ELSE NULL END AS fare_ptl_ec,
CASE WHEN ss.seat_count_pwd_ec IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_ec.fare_multiplier * ct_ec.concession_pwd ELSE NULL END AS fare_pwd_ec,
CASE WHEN ss.seat_count_senior_ec IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_ec.fare_multiplier * ct_ec.concession_senior ELSE NULL END AS fare_senior_ec,

-- EA
CASE WHEN ss.seat_count_gen_ea IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_ea.fare_multiplier ELSE NULL END AS fare_gen_ea,
CASE WHEN ss.seat_count_ttl_ea IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_ea.fare_multiplier + ct_ea.tatkal_charge_adder ELSE NULL END AS fare_ttl_ea,
CASE WHEN ss.seat_count_ptl_ea IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_ea.fare_multiplier + ct_ea.premium_tatkal_charge_adder ELSE NULL END AS fare_ptl_ea,
CASE WHEN ss.seat_count_pwd_ea IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_ea.fare_multiplier * ct_ea.concession_pwd ELSE NULL END AS fare_pwd_ea,
CASE WHEN ss.seat_count_senior_ea IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_ea.fare_multiplier * ct_ea.concession_senior ELSE NULL END AS fare_senior_ea,

-- E3
CASE WHEN ss.seat_count_gen_e3 IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_e3.fare_multiplier ELSE NULL END AS fare_gen_e3,
CASE WHEN ss.seat_count_ttl_e3 IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_e3.fare_multiplier + ct_e3.tatkal_charge_adder ELSE NULL END AS fare_ttl_e3,
CASE WHEN ss.seat_count_ptl_e3 IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_e3.fare_multiplier + ct_e3.premium_tatkal_charge_adder ELSE NULL END AS fare_ptl_e3,
CASE WHEN ss.seat_count_pwd_e3 IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_e3.fare_multiplier * ct_e3.concession_pwd ELSE NULL END AS fare_pwd_e3,
CASE WHEN ss.seat_count_senior_e3 IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_e3.fare_multiplier * ct_e3.concession_senior ELSE NULL END AS fare_senior_e3,

-- FC
CASE WHEN ss.seat_count_gen_fc IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_fc.fare_multiplier ELSE NULL END AS fare_gen_fc,
CASE WHEN ss.seat_count_ttl_fc IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_fc.fare_multiplier + ct_fc.tatkal_charge_adder ELSE NULL END AS fare_ttl_fc,
CASE WHEN ss.seat_count_ptl_fc IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_fc.fare_multiplier + ct_fc.premium_tatkal_charge_adder ELSE NULL END AS fare_ptl_fc,
CASE WHEN ss.seat_count_pwd_fc IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_fc.fare_multiplier * ct_fc.concession_pwd ELSE NULL END AS fare_pwd_fc,
CASE WHEN ss.seat_count_senior_fc IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_fc.fare_multiplier * ct_fc.concession_senior ELSE NULL END AS fare_senior_fc,

-- 2S
CASE WHEN ss.seat_count_gen_2s IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_2s.fare_multiplier ELSE NULL END AS fare_gen_2s,
CASE WHEN ss.seat_count_ttl_2s IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_2s.fare_multiplier + ct_2s.tatkal_charge_adder ELSE NULL END AS fare_ttl_2s,
CASE WHEN ss.seat_count_ptl_2s IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_2s.fare_multiplier + ct_2s.premium_tatkal_charge_adder ELSE NULL END AS fare_ptl_2s,
CASE WHEN ss.seat_count_pwd_2s IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_2s.fare_multiplier * ct_2s.concession_pwd ELSE NULL END AS fare_pwd_2s,
CASE WHEN ss.seat_count_senior_2s IS NOT NULL THEN (s2.kilometer - s1.kilometer) * ct_2s.fare_multiplier * ct_2s.concession_senior ELSE NULL END AS fare_senior_2s

FROM trains_filtered tf
LEFT JOIN schedules s1 ON s1.train_number = tf.train_number AND s1.station_code = (SELECT source_code FROM params)
LEFT JOIN schedules s2 ON s2.train_number = tf.train_number AND s2.station_code = (SELECT destination_code FROM params)
LEFT JOIN seat_summary ss ON ss.train_number = tf.train_number

-- Coachtype joins for fares
LEFT JOIN coachtype ct_sl ON ct_sl.coach_code = 'SL'
LEFT JOIN coachtype ct_3a ON ct_3a.coach_code = '3A'
LEFT JOIN coachtype ct_2a ON ct_2a.coach_code = '2A'
LEFT JOIN coachtype ct_1a ON ct_1a.coach_code = '1A'
LEFT JOIN coachtype ct_cc ON ct_cc.coach_code = 'CC'
LEFT JOIN coachtype ct_ec ON ct_ec.coach_code = 'EC'
LEFT JOIN coachtype ct_ea ON ct_ea.coach_code = 'EA'
LEFT JOIN coachtype ct_e3 ON ct_e3.coach_code = 'E3'
LEFT JOIN coachtype ct_fc ON ct_fc.coach_code = 'FC'
LEFT JOIN coachtype ct_2s ON ct_2s.coach_code = '2S'

ORDER BY s1.departure, tf.train_number;`,
      [source_code, destination_code, doj]
    );
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
module.exports = searchTrains;
