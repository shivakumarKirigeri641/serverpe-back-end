const checkForValidDate = require("../../utils/checkForValidDate");
const convertSearchTrainsToJson = require("../../utils/convertSearchTrainsToJson");

const searchTrains = async (client, source_code, destination_code, doj) => {
  let search_train_details = null;
  try {
    //check date
    if (!checkForValidDate(doj)) {
      throw {
        status: 400,
        message: `Invalid date selected!`,
        data: {},
      };
    }
    //src exists
    const result_src = await client.query(
      `select id from stations where code = $1`,
      [source_code]
    );
    if (0 === result_src.rows.length) {
      throw {
        status: 400,
        message: `Source ${source_code} not found!`,
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
        message: `Destination ${destination_code} not found!`,
        data: {},
      };
    }
    search_train_details = await client.query(
      `WITH params AS (
    SELECT 
        $3::date AS journey_date,       -- user-selected date
        $1::text AS source_code,              -- source station
        $2::text AS destination_code,         -- destination station
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

    -- SL
    MAX(CASE WHEN ss_sl.fk_reservation_type = 1 THEN ss_sl.available_seats END) AS sl_gen,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 3 THEN ss_sl.available_seats END) AS sl_ttl,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 4 THEN ss_sl.available_seats END) AS sl_ptl,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 5 THEN ss_sl.available_seats END) AS sl_ladies,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 6 THEN ss_sl.available_seats END) AS sl_pwd,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 7 THEN ss_sl.available_seats END) AS sl_rac,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 8 THEN ss_sl.available_seats END) AS sl_duty,
    MAX(CASE WHEN ss_sl.fk_reservation_type = 9 THEN ss_sl.available_seats END) AS sl_senior,
    MAX(wl_sl.waiting_count) AS sl_waiting,
    COALESCE((s2.kilometer - s1.kilometer) * ct_sl.fare_multiplier, NULL) AS sl_fare,

    -- 3A
    MAX(CASE WHEN ss_a3.fk_reservation_type = 1 THEN ss_a3.available_seats END) AS a3_gen,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 3 THEN ss_a3.available_seats END) AS a3_ttl,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 4 THEN ss_a3.available_seats END) AS a3_ptl,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 5 THEN ss_a3.available_seats END) AS a3_ladies,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 6 THEN ss_a3.available_seats END) AS a3_pwd,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 7 THEN ss_a3.available_seats END) AS a3_rac,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 8 THEN ss_a3.available_seats END) AS a3_duty,
    MAX(CASE WHEN ss_a3.fk_reservation_type = 9 THEN ss_a3.available_seats END) AS a3_senior,
    MAX(wl_a3.waiting_count) AS a3_waiting,
    COALESCE((s2.kilometer - s1.kilometer) * ct_a3.fare_multiplier, NULL) AS a3_fare,

    -- 2A
    MAX(CASE WHEN ss_2a.fk_reservation_type = 1 THEN ss_2a.available_seats END) AS a2_gen,
    MAX(CASE WHEN ss_2a.fk_reservation_type = 3 THEN ss_2a.available_seats END) AS a2_ttl,
    MAX(CASE WHEN ss_2a.fk_reservation_type = 4 THEN ss_2a.available_seats END) AS a2_ptl,
    MAX(CASE WHEN ss_2a.fk_reservation_type = 5 THEN ss_2a.available_seats END) AS a2_ladies,
    MAX(CASE WHEN ss_2a.fk_reservation_type = 6 THEN ss_2a.available_seats END) AS a2_pwd,
    MAX(CASE WHEN ss_2a.fk_reservation_type = 7 THEN ss_2a.available_seats END) AS a2_rac,
    MAX(CASE WHEN ss_2a.fk_reservation_type = 8 THEN ss_2a.available_seats END) AS a2_duty,
    MAX(CASE WHEN ss_2a.fk_reservation_type = 9 THEN ss_2a.available_seats END) AS a2_senior,
    MAX(wl_2a.waiting_count) AS a2_waiting,
    COALESCE((s2.kilometer - s1.kilometer) * ct_2a.fare_multiplier, NULL) AS a2_fare,

    -- 1A
    MAX(CASE WHEN ss_1a.fk_reservation_type = 1 THEN ss_1a.available_seats END) AS a1_gen,    
    COALESCE((s2.kilometer - s1.kilometer) * ct_1a.fare_multiplier, NULL) AS a1_fare,

    -- CC
    MAX(CASE WHEN ss_cc.fk_reservation_type = 1 THEN ss_cc.available_seats END) AS cc_gen,
    MAX(CASE WHEN ss_cc.fk_reservation_type = 3 THEN ss_cc.available_seats END) AS cc_ttl,
    MAX(CASE WHEN ss_cc.fk_reservation_type = 4 THEN ss_cc.available_seats END) AS cc_ptl,
    MAX(CASE WHEN ss_cc.fk_reservation_type = 5 THEN ss_cc.available_seats END) AS cc_ladies,
    MAX(CASE WHEN ss_cc.fk_reservation_type = 6 THEN ss_cc.available_seats END) AS cc_pwd,
    MAX(CASE WHEN ss_cc.fk_reservation_type = 7 THEN ss_cc.available_seats END) AS cc_rac,
    MAX(CASE WHEN ss_cc.fk_reservation_type = 8 THEN ss_cc.available_seats END) AS cc_duty,
    MAX(CASE WHEN ss_cc.fk_reservation_type = 9 THEN ss_cc.available_seats END) AS cc_senior,
    MAX(wl_cc.waiting_count) AS cc_waiting,
    COALESCE((s2.kilometer - s1.kilometer) * ct_cc.fare_multiplier, NULL) AS cc_fare,

    -- EC
    MAX(CASE WHEN ss_ec.fk_reservation_type = 1 THEN ss_ec.available_seats END) AS ec_gen,
    MAX(wl_ec.waiting_count) AS ec_waiting,
    COALESCE((s2.kilometer - s1.kilometer) * ct_ec.fare_multiplier, NULL) AS ec_fare,

    -- EA
    MAX(CASE WHEN ss_ea.fk_reservation_type = 1 THEN ss_ea.available_seats END) AS ea_gen,
    MAX(wl_ea.waiting_count) AS ea_waiting,
    COALESCE((s2.kilometer - s1.kilometer) * ct_ea.fare_multiplier, NULL) AS ea_fare,

    -- E3
    MAX(CASE WHEN ss_e3.fk_reservation_type = 1 THEN ss_e3.available_seats END) AS e3_gen,
    MAX(wl_e3.waiting_count) AS e3_waiting,
    COALESCE((s2.kilometer - s1.kilometer) * ct_e3.fare_multiplier, NULL) AS e3_fare,

    -- FC
    MAX(CASE WHEN ss_fc.fk_reservation_type = 1 THEN ss_fc.available_seats END) AS fc_gen,    
    COALESCE((s2.kilometer - s1.kilometer) * ct_fc.fare_multiplier, NULL) AS fc_fare

FROM trains t
JOIN coaches c
    ON c.train_number = t.train_number
    AND (c.sl='Y' OR c.a_3='Y' OR c.a_1='Y' OR c.a_2='Y' OR c._2S='Y' 
         OR c.cc='Y' OR c.ec='Y' OR c.ea='Y' OR c.e_3='Y' OR c.fc='Y')
CROSS JOIN params p
JOIN schedules s1 ON s1.train_number = t.train_number AND s1.station_code = p.source_code
JOIN schedules s2 ON s2.train_number = t.train_number AND s2.station_code = p.destination_code

-- Seat summaries
LEFT JOIN seatsondate_sl_summary ss_sl ON ss_sl.train_number = t.train_number AND ss_sl.date_of_journey = p.journey_date
LEFT JOIN seatsondate_3a_summary ss_a3 ON ss_a3.train_number = t.train_number AND ss_a3.date_of_journey = p.journey_date
LEFT JOIN seatsondate_2a_summary ss_2a ON ss_2a.train_number = t.train_number AND ss_2a.date_of_journey = p.journey_date
LEFT JOIN seatsondate_1a_summary ss_1a ON ss_1a.train_number = t.train_number AND ss_1a.date_of_journey = p.journey_date
LEFT JOIN seatsondate_cc_summary ss_cc ON ss_cc.train_number = t.train_number AND ss_cc.date_of_journey = p.journey_date
LEFT JOIN seatsondate_ec_summary ss_ec ON ss_ec.train_number = t.train_number AND ss_ec.date_of_journey = p.journey_date
LEFT JOIN seatsondate_ea_summary ss_ea ON ss_ea.train_number = t.train_number AND ss_ea.date_of_journey = p.journey_date
LEFT JOIN seatsondate_e3_summary ss_e3 ON ss_e3.train_number = t.train_number AND ss_e3.date_of_journey = p.journey_date
LEFT JOIN seatsondate_fc_summary ss_fc ON ss_fc.train_number = t.train_number AND ss_fc.date_of_journey = p.journey_date

-- Waiting lists
LEFT JOIN waitinglist_sl_summary wl_sl ON wl_sl.train_number = t.train_number AND wl_sl.date_of_journey = p.journey_date
LEFT JOIN waitinglist_a3_summary wl_a3 ON wl_a3.train_number = t.train_number AND wl_a3.date_of_journey = p.journey_date
LEFT JOIN waitinglist_2a_summary wl_2a ON wl_2a.train_number = t.train_number AND wl_2a.date_of_journey = p.journey_date
LEFT JOIN waitinglist_cc_summary wl_cc ON wl_cc.train_number = t.train_number AND wl_cc.date_of_journey = p.journey_date
LEFT JOIN waitinglist_ec_summary wl_ec ON wl_ec.train_number = t.train_number AND wl_ec.date_of_journey = p.journey_date
LEFT JOIN waitinglist_ea_summary wl_ea ON wl_ea.train_number = t.train_number AND wl_ea.date_of_journey = p.journey_date
LEFT JOIN waitinglist_e3_summary wl_e3 ON wl_e3.train_number = t.train_number AND wl_e3.date_of_journey = p.journey_date

-- Coach fares
LEFT JOIN coachtype ct_sl ON ct_sl.coach_code='SL'
LEFT JOIN coachtype ct_a3 ON ct_a3.coach_code='3A'
LEFT JOIN coachtype ct_2a ON ct_2a.coach_code='2A'
LEFT JOIN coachtype ct_1a ON ct_1a.coach_code='1A'
LEFT JOIN coachtype ct_cc ON ct_cc.coach_code='CC'
LEFT JOIN coachtype ct_ec ON ct_ec.coach_code='EC'
LEFT JOIN coachtype ct_ea ON ct_ea.coach_code='EA'
LEFT JOIN coachtype ct_e3 ON ct_e3.coach_code='E3'
LEFT JOIN coachtype ct_fc ON ct_fc.coach_code='FC'

WHERE s1.station_sequence < s2.station_sequence
  AND (p.journey_date > CURRENT_DATE 
       OR (p.journey_date = CURRENT_DATE AND (p.now_ist + INTERVAL '4 hour') < (s1.departure + p.journey_date::timestamp)))
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
         s1.departure, s2.arrival, s2.kilometer, s1.kilometer,
         ct_sl.fare_multiplier, ct_a3.fare_multiplier, ct_2a.fare_multiplier, ct_1a.fare_multiplier,
         ct_cc.fare_multiplier, ct_ec.fare_multiplier, ct_ea.fare_multiplier, ct_e3.fare_multiplier, ct_fc.fare_multiplier

ORDER BY t.train_number, s1.departure;
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
