const getReservedTrains = async (
  client,
  source_code,
  destination_code,
  date_of_journey
) => {
  try {
    result = await client.query(
      `WITH params AS (
  -- Tatkal multiplier
  SELECT 1.3::numeric AS tatkal_multiplier
)
SELECT 
    t.train_number,
    t.train_name,
    s1.station_code AS from_code,
    s2.station_code AS to_code,
    s1.station_name AS from_name,
    s2.station_name AS to_name,
    (s2.kilometer - s1.kilometer) AS distance_km,

    -- 🧮 Seat Availability Counts
    CASE 
      WHEN s.date_of_journey = CURRENT_DATE OR s.date_of_journey = CURRENT_DATE + INTERVAL '1 day' THEN
        COALESCE((LENGTH(s.coach_sl) - LENGTH(REPLACE(s.coach_sl, 'TTL/AVL', ''))) / LENGTH('TTL/AVL'), 0) +
        COALESCE((LENGTH(s.coach_sl) - LENGTH(REPLACE(s.coach_sl, 'PTL/AVL', ''))) / LENGTH('PTL/AVL'), 0)
      ELSE
        GREATEST(
          COALESCE((LENGTH(s.coach_sl) - LENGTH(REPLACE(s.coach_sl, 'GEN/AVL', ''))) / LENGTH('GEN/AVL'), 0),
          COALESCE((LENGTH(s.coach_sl) - LENGTH(REPLACE(s.coach_sl, 'RAC/AVL', ''))) / LENGTH('RAC/AVL'), 0)
        )
    END AS sl_available,

    CASE 
      WHEN s.date_of_journey = CURRENT_DATE OR s.date_of_journey = CURRENT_DATE + INTERVAL '1 day' THEN
        COALESCE((LENGTH(s.coach_1a) - LENGTH(REPLACE(s.coach_1a, 'TTL/AVL', ''))) / LENGTH('TTL/AVL'), 0) +
        COALESCE((LENGTH(s.coach_1a) - LENGTH(REPLACE(s.coach_1a, 'PTL/AVL', ''))) / LENGTH('PTL/AVL'), 0)
      ELSE
        GREATEST(
          COALESCE((LENGTH(s.coach_1a) - LENGTH(REPLACE(s.coach_1a, 'GEN/AVL', ''))) / LENGTH('GEN/AVL'), 0),
          COALESCE((LENGTH(s.coach_1a) - LENGTH(REPLACE(s.coach_1a, 'RAC/AVL', ''))) / LENGTH('RAC/AVL'), 0)
        )
    END AS "1a_available",

    CASE 
      WHEN s.date_of_journey = CURRENT_DATE OR s.date_of_journey = CURRENT_DATE + INTERVAL '1 day' THEN
        COALESCE((LENGTH(s.coach_2a) - LENGTH(REPLACE(s.coach_2a, 'TTL/AVL', ''))) / LENGTH('TTL/AVL'), 0) +
        COALESCE((LENGTH(s.coach_2a) - LENGTH(REPLACE(s.coach_2a, 'PTL/AVL', ''))) / LENGTH('PTL/AVL'), 0)
      ELSE
        GREATEST(
          COALESCE((LENGTH(s.coach_2a) - LENGTH(REPLACE(s.coach_2a, 'GEN/AVL', ''))) / LENGTH('GEN/AVL'), 0),
          COALESCE((LENGTH(s.coach_2a) - LENGTH(REPLACE(s.coach_2a, 'RAC/AVL', ''))) / LENGTH('RAC/AVL'), 0)
        )
    END AS "2a_available",

    CASE 
      WHEN s.date_of_journey = CURRENT_DATE OR s.date_of_journey = CURRENT_DATE + INTERVAL '1 day' THEN
        COALESCE((LENGTH(s.coach_3a) - LENGTH(REPLACE(s.coach_3a, 'TTL/AVL', ''))) / LENGTH('TTL/AVL'), 0) +
        COALESCE((LENGTH(s.coach_3a) - LENGTH(REPLACE(s.coach_3a, 'PTL/AVL', ''))) / LENGTH('PTL/AVL'), 0)
      ELSE
        GREATEST(
          COALESCE((LENGTH(s.coach_3a) - LENGTH(REPLACE(s.coach_3a, 'GEN/AVL', ''))) / LENGTH('GEN/AVL'), 0),
          COALESCE((LENGTH(s.coach_3a) - LENGTH(REPLACE(s.coach_3a, 'RAC/AVL', ''))) / LENGTH('RAC/AVL'), 0)
        )
    END AS "3a_available",

    CASE 
      WHEN s.date_of_journey = CURRENT_DATE OR s.date_of_journey = CURRENT_DATE + INTERVAL '1 day' THEN
        COALESCE((LENGTH(s.coach_ea) - LENGTH(REPLACE(s.coach_ea, 'TTL/AVL', ''))) / LENGTH('TTL/AVL'), 0) +
        COALESCE((LENGTH(s.coach_ea) - LENGTH(REPLACE(s.coach_ea, 'PTL/AVL', ''))) / LENGTH('PTL/AVL'), 0)
      ELSE
        GREATEST(
          COALESCE((LENGTH(s.coach_ea) - LENGTH(REPLACE(s.coach_ea, 'GEN/AVL', ''))) / LENGTH('GEN/AVL'), 0),
          COALESCE((LENGTH(s.coach_ea) - LENGTH(REPLACE(s.coach_ea, 'RAC/AVL', ''))) / LENGTH('RAC/AVL'), 0)
        )
    END AS ea_available,

    CASE 
      WHEN s.date_of_journey = CURRENT_DATE OR s.date_of_journey = CURRENT_DATE + INTERVAL '1 day' THEN
        COALESCE((LENGTH(s.coach_e3) - LENGTH(REPLACE(s.coach_e3, 'TTL/AVL', ''))) / LENGTH('TTL/AVL'), 0) +
        COALESCE((LENGTH(s.coach_e3) - LENGTH(REPLACE(s.coach_e3, 'PTL/AVL', ''))) / LENGTH('PTL/AVL'), 0)
      ELSE
        GREATEST(
          COALESCE((LENGTH(s.coach_e3) - LENGTH(REPLACE(s.coach_e3, 'GEN/AVL', ''))) / LENGTH('GEN/AVL'), 0),
          COALESCE((LENGTH(s.coach_e3) - LENGTH(REPLACE(s.coach_e3, 'RAC/AVL', ''))) / LENGTH('RAC/AVL'), 0)
        )
    END AS e3_available,

    CASE 
      WHEN s.date_of_journey = CURRENT_DATE OR s.date_of_journey = CURRENT_DATE + INTERVAL '1 day' THEN
        COALESCE((LENGTH(s.coach_ec) - LENGTH(REPLACE(s.coach_ec, 'TTL/AVL', ''))) / LENGTH('TTL/AVL'), 0) +
        COALESCE((LENGTH(s.coach_ec) - LENGTH(REPLACE(s.coach_ec, 'PTL/AVL', ''))) / LENGTH('PTL/AVL'), 0)
      ELSE
        GREATEST(
          COALESCE((LENGTH(s.coach_ec) - LENGTH(REPLACE(s.coach_ec, 'GEN/AVL', ''))) / LENGTH('GEN/AVL'), 0),
          COALESCE((LENGTH(s.coach_ec) - LENGTH(REPLACE(s.coach_ec, 'RAC/AVL', ''))) / LENGTH('RAC/AVL'), 0)
        )
    END AS ec_available,

    CASE 
      WHEN s.date_of_journey = CURRENT_DATE OR s.date_of_journey = CURRENT_DATE + INTERVAL '1 day' THEN
        COALESCE((LENGTH(s.coach_cc) - LENGTH(REPLACE(s.coach_cc, 'TTL/AVL', ''))) / LENGTH('TTL/AVL'), 0) +
        COALESCE((LENGTH(s.coach_cc) - LENGTH(REPLACE(s.coach_cc, 'PTL/AVL', ''))) / LENGTH('PTL/AVL'), 0)
      ELSE
        GREATEST(
          COALESCE((LENGTH(s.coach_cc) - LENGTH(REPLACE(s.coach_cc, 'GEN/AVL', ''))) / LENGTH('GEN/AVL'), 0),
          COALESCE((LENGTH(s.coach_cc) - LENGTH(REPLACE(s.coach_cc, 'RAC/AVL', ''))) / LENGTH('RAC/AVL'), 0)
        )
    END AS cc_available,

    CASE 
      WHEN s.date_of_journey = CURRENT_DATE OR s.date_of_journey = CURRENT_DATE + INTERVAL '1 day' THEN
        COALESCE((LENGTH(s.coach_fc) - LENGTH(REPLACE(s.coach_fc, 'TTL/AVL', ''))) / LENGTH('TTL/AVL'), 0) +
        COALESCE((LENGTH(s.coach_fc) - LENGTH(REPLACE(s.coach_fc, 'PTL/AVL', ''))) / LENGTH('PTL/AVL'), 0)
      ELSE
        GREATEST(
          COALESCE((LENGTH(s.coach_fc) - LENGTH(REPLACE(s.coach_fc, 'GEN/AVL', ''))) / LENGTH('GEN/AVL'), 0),
          COALESCE((LENGTH(s.coach_fc) - LENGTH(REPLACE(s.coach_fc, 'RAC/AVL', ''))) / LENGTH('RAC/AVL'), 0)
        )
    END AS fc_available,

    -- 💰 Base Fares (distance × price)
    ROUND(((s2.kilometer - s1.kilometer) * p.price_sl)::numeric, 2) AS base_fare_sl,
    ROUND(((s2.kilometer - s1.kilometer) * p.price_1a)::numeric, 2) AS base_fare_1a,
    ROUND(((s2.kilometer - s1.kilometer) * p.price_2a)::numeric, 2) AS base_fare_2a,
    ROUND(((s2.kilometer - s1.kilometer) * p.price_3a)::numeric, 2) AS base_fare_3a,
    ROUND(((s2.kilometer - s1.kilometer) * p.price_cc)::numeric, 2) AS base_fare_cc,
    ROUND(((s2.kilometer - s1.kilometer) * p.price_ec)::numeric, 2) AS base_fare_ec,
    ROUND(((s2.kilometer - s1.kilometer) * p.price_fc)::numeric, 2) AS base_fare_fc,
    ROUND(((s2.kilometer - s1.kilometer) * p.price_e3)::numeric, 2) AS base_fare_e3,
    ROUND(((s2.kilometer - s1.kilometer) * p.price_ea)::numeric, 2) AS base_fare_ea,

    -- 💸 Tatkal fares (only for tomorrow; NULL otherwise)
    CASE
      WHEN s.date_of_journey = CURRENT_DATE + INTERVAL '1 day'
      THEN ROUND(((s2.kilometer - s1.kilometer) * p.price_sl * params.tatkal_multiplier)::numeric, 2)
      ELSE NULL
    END AS sl_tatkal_fare,
    CASE
      WHEN s.date_of_journey = CURRENT_DATE + INTERVAL '1 day'
      THEN ROUND(((s2.kilometer - s1.kilometer) * p.price_1a * params.tatkal_multiplier)::numeric, 2)
      ELSE NULL
    END AS "1a_tatkal_fare",
    CASE
      WHEN s.date_of_journey = CURRENT_DATE + INTERVAL '1 day'
      THEN ROUND(((s2.kilometer - s1.kilometer) * p.price_2a * params.tatkal_multiplier)::numeric, 2)
      ELSE NULL
    END AS "2a_tatkal_fare",
    CASE
      WHEN s.date_of_journey = CURRENT_DATE + INTERVAL '1 day'
      THEN ROUND(((s2.kilometer - s1.kilometer) * p.price_3a * params.tatkal_multiplier)::numeric, 2)
      ELSE NULL
    END AS "3a_tatkal_fare",
    CASE
      WHEN s.date_of_journey = CURRENT_DATE + INTERVAL '1 day'
      THEN ROUND(((s2.kilometer - s1.kilometer) * p.price_ea * params.tatkal_multiplier)::numeric, 2)
      ELSE NULL
    END AS ea_tatkal_fare,
    CASE
      WHEN s.date_of_journey = CURRENT_DATE + INTERVAL '1 day'
      THEN ROUND(((s2.kilometer - s1.kilometer) * p.price_e3 * params.tatkal_multiplier)::numeric, 2)
      ELSE NULL
    END AS e3_tatkal_fare,
    CASE
      WHEN s.date_of_journey = CURRENT_DATE + INTERVAL '1 day'
      THEN ROUND(((s2.kilometer - s1.kilometer) * p.price_ec * params.tatkal_multiplier)::numeric, 2)
      ELSE NULL
    END AS ec_tatkal_fare,
    CASE
      WHEN s.date_of_journey = CURRENT_DATE + INTERVAL '1 day'
      THEN ROUND(((s2.kilometer - s1.kilometer) * p.price_cc * params.tatkal_multiplier)::numeric, 2)
      ELSE NULL
    END AS cc_tatkal_fare,
    CASE
      WHEN s.date_of_journey = CURRENT_DATE + INTERVAL '1 day'
      THEN ROUND(((s2.kilometer - s1.kilometer) * p.price_fc * params.tatkal_multiplier)::numeric, 2)
      ELSE NULL
    END AS fc_tatkal_fare

FROM trains t
JOIN schedules s1 ON t.train_number = s1.train_number
JOIN schedules s2 ON t.train_number = s2.train_number
JOIN seatsondate s ON s.train_number = t.train_number
CROSS JOIN pricelist p
CROSS JOIN params
WHERE s1.station_code = $1
  AND s2.station_code = $2
  AND s1.station_sequence < s2.station_sequence
  AND s.date_of_journey = $3
  AND (
    -- ⏰ Only show upcoming trains if journey date is today
    s.date_of_journey <> CURRENT_DATE 
    OR (s.date_of_journey = CURRENT_DATE AND s1.departure > CURRENT_TIME)
  );
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
