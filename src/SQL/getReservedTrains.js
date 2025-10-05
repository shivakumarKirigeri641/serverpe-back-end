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
        CURRENT_DATE AS today,
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata' AS now_ist
)
SELECT 
    t.train_number,
    t.train_name,
    s1.station_code AS from_code,
    s2.station_code AS to_code,
    s1.station_name AS from_name,
    s2.station_name AS to_name,
    (s2.kilometer - s1.kilometer) AS distance_km,

    -- SL Coach
    (LENGTH(s.coach_sl) - LENGTH(REPLACE(s.coach_sl, 'GEN/AVL', ''))) / LENGTH('GEN/AVL') AS sl_normal_available,
    CASE WHEN s.date_of_journey IN (p.today, p.today + INTERVAL '1 day') THEN
        (LENGTH(s.coach_sl) - LENGTH(REPLACE(s.coach_sl, 'TTL/AVL', ''))) / LENGTH('TTL/AVL')
    ELSE 0 END AS sl_ttl_available,
    CASE WHEN s.date_of_journey IN (p.today, p.today + INTERVAL '1 day') THEN
        (LENGTH(s.coach_sl) - LENGTH(REPLACE(s.coach_sl, 'PTL/AVL', ''))) / LENGTH('PTL/AVL')
    ELSE 0 END AS sl_ptl_available,
    (LENGTH(s.coach_sl) - LENGTH(REPLACE(s.coach_sl, 'WLT', ''))) / LENGTH('WLT') AS sl_wtl_count,
    ROUND((s2.kilometer - s1.kilometer) * psl.price_sl::numeric, 2) AS sl_base_fare,

    -- 1A Coach
    (LENGTH(s.coach_1a) - LENGTH(REPLACE(s.coach_1a, 'GEN/AVL', ''))) / LENGTH('GEN/AVL') AS a1_normal_available,
    CASE WHEN s.date_of_journey IN (p.today, p.today + INTERVAL '1 day') THEN
        (LENGTH(s.coach_1a) - LENGTH(REPLACE(s.coach_1a, 'TTL/AVL', ''))) / LENGTH('TTL/AVL')
    ELSE 0 END AS a1_ttl_available,
    CASE WHEN s.date_of_journey IN (p.today, p.today + INTERVAL '1 day') THEN
        (LENGTH(s.coach_1a) - LENGTH(REPLACE(s.coach_1a, 'PTL/AVL', ''))) / LENGTH('PTL/AVL')
    ELSE 0 END AS a1_ptl_available,
    (LENGTH(s.coach_1a) - LENGTH(REPLACE(s.coach_1a, 'WLT', ''))) / LENGTH('WLT') AS a1_wtl_count,
    ROUND((s2.kilometer - s1.kilometer) * psl.price_1a::numeric, 2) AS a1_base_fare,

    -- 2A Coach
    (LENGTH(s.coach_2a) - LENGTH(REPLACE(s.coach_2a, 'GEN/AVL', ''))) / LENGTH('GEN/AVL') AS a2_normal_available,
    CASE WHEN s.date_of_journey IN (p.today, p.today + INTERVAL '1 day') THEN
        (LENGTH(s.coach_2a) - LENGTH(REPLACE(s.coach_2a, 'TTL/AVL', ''))) / LENGTH('TTL/AVL')
    ELSE 0 END AS a2_ttl_available,
    CASE WHEN s.date_of_journey IN (p.today, p.today + INTERVAL '1 day') THEN
        (LENGTH(s.coach_2a) - LENGTH(REPLACE(s.coach_2a, 'PTL/AVL', ''))) / LENGTH('PTL/AVL')
    ELSE 0 END AS a2_ptl_available,
    (LENGTH(s.coach_2a) - LENGTH(REPLACE(s.coach_2a, 'WLT', ''))) / LENGTH('WLT') AS a2_wtl_count,
    ROUND((s2.kilometer - s1.kilometer) * psl.price_2a::numeric, 2) AS a2_base_fare,

    -- 3A Coach
    (LENGTH(s.coach_3a) - LENGTH(REPLACE(s.coach_3a, 'GEN/AVL', ''))) / LENGTH('GEN/AVL') AS a3_normal_available,
    CASE WHEN s.date_of_journey IN (p.today, p.today + INTERVAL '1 day') THEN
        (LENGTH(s.coach_3a) - LENGTH(REPLACE(s.coach_3a, 'TTL/AVL', ''))) / LENGTH('TTL/AVL')
    ELSE 0 END AS a3_ttl_available,
    CASE WHEN s.date_of_journey IN (p.today, p.today + INTERVAL '1 day') THEN
        (LENGTH(s.coach_3a) - LENGTH(REPLACE(s.coach_3a, 'PTL/AVL', ''))) / LENGTH('PTL/AVL')
    ELSE 0 END AS a3_ptl_available,
    (LENGTH(s.coach_3a) - LENGTH(REPLACE(s.coach_3a, 'WLT', ''))) / LENGTH('WLT') AS a3_wtl_count,
    ROUND((s2.kilometer - s1.kilometer) * psl.price_3a::numeric, 2) AS a3_base_fare,

    -- CC Coach
    (LENGTH(s.coach_cc) - LENGTH(REPLACE(s.coach_cc, 'GEN/AVL', ''))) / LENGTH('GEN/AVL') AS cc_normal_available,
    CASE WHEN s.date_of_journey IN (p.today, p.today + INTERVAL '1 day') THEN
        (LENGTH(s.coach_cc) - LENGTH(REPLACE(s.coach_cc, 'TTL/AVL', ''))) / LENGTH('TTL/AVL')
    ELSE 0 END AS cc_ttl_available,
    CASE WHEN s.date_of_journey IN (p.today, p.today + INTERVAL '1 day') THEN
        (LENGTH(s.coach_cc) - LENGTH(REPLACE(s.coach_cc, 'PTL/AVL', ''))) / LENGTH('PTL/AVL')
    ELSE 0 END AS cc_ptl_available,
    (LENGTH(s.coach_cc) - LENGTH(REPLACE(s.coach_cc, 'WLT', ''))) / LENGTH('WLT') AS cc_wtl_count,
    ROUND((s2.kilometer - s1.kilometer) * psl.price_cc::numeric, 2) AS cc_base_fare

    -- Repeat same pattern for EC, E3, EA, FC
FROM 
    trains t
JOIN schedules s1 ON t.train_number = s1.train_number
JOIN schedules s2 ON t.train_number = s2.train_number
JOIN seatsondate s ON s.train_number = t.train_number
CROSS JOIN pricelist psl
JOIN params p ON TRUE
WHERE 
    s1.station_code = $1
    AND s2.station_code = $2
    AND s1.station_sequence < s2.station_sequence
    AND s.date_of_journey = $3
    AND (
        s.date_of_journey > p.today
        OR (s.date_of_journey = p.today AND (p.today + s1.departure) > p.now_ist)
    )
ORDER BY t.train_number;
`,
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
