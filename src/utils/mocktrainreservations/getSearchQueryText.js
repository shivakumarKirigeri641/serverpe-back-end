const getSearchQueryText = () => {
  return `WITH params AS (
    SELECT
        $1::TEXT AS src,
        $2::TEXT AS dst,
        $3::DATE AS doj
),

/* ---------------------------------------------------------
   VALID TRAINS
--------------------------------------------------------- */
valid_trains AS (
    SELECT
        c.train_number,
        t.train_name,
        t.train_type,

        s1.station_code AS source_station,
        s2.station_code AS destination_station,

        s1.departure AS departure,
        s2.arrival   AS arrival,

        (
            (p.doj + s2.arrival)
            + CASE
                WHEN s2.arrival < s1.departure
                THEN INTERVAL '1 day'
                ELSE INTERVAL '0 day'
              END
        ) - (p.doj + s1.departure) AS journey_duration,

        (s2.kilometer - s1.kilometer) AS journey_km,

        json_build_array(
            CASE WHEN t.train_runs_on_mon = 'Y' THEN 'Mon' END,
            CASE WHEN t.train_runs_on_tue = 'Y' THEN 'Tue' END,
            CASE WHEN t.train_runs_on_wed = 'Y' THEN 'Wed' END,
            CASE WHEN t.train_runs_on_thu = 'Y' THEN 'Thu' END,
            CASE WHEN t.train_runs_on_fri = 'Y' THEN 'Fri' END,
            CASE WHEN t.train_runs_on_sat = 'Y' THEN 'Sat' END,
            CASE WHEN t.train_runs_on_sun = 'Y' THEN 'Sun' END
        ) AS running_days

    FROM trains t
	JOIN coaches c ON c.train_number = t.train_number
    JOIN schedules s1 ON s1.train_number = t.train_number	
    JOIN schedules s2 ON s2.train_number = t.train_number
    JOIN params p ON TRUE
    WHERE
        s1.station_code = p.src
        AND s2.station_code = p.dst
        AND s1.station_sequence < s2.station_sequence
),

/* ---------------------------------------------------------
   COACH CAPACITY
--------------------------------------------------------- */
coach_capacity AS (
    SELECT
        c.train_number,
        x.coach_code,
        CASE
            WHEN x.bogi_count IS NULL THEN NULL
            ELSE x.bogi_count * x.seats_per_bogi
        END AS total_seats
    FROM coaches c
    CROSS JOIN LATERAL (
        VALUES
            ('SL', c.bogi_count_sl, 72),
            ('2A', c.bogi_count_2a, 44),
            ('3A', c.bogi_count_3a, 64),
            ('2S', c.bogi_count_2s, 108),
            ('CC', c.bogi_count_cc, 78),
            ('EC', c.bogi_count_ec, 56),
            ('E3', c.bogi_count_e3, 84),
            ('EA', c.bogi_count_ea, 56),
            ('FC', c.bogi_count_fc, 22),
            ('1A', c.bogi_count_1a, 22)
    ) AS x(coach_code, bogi_count, seats_per_bogi)
),

/* ---------------------------------------------------------
   SEAT LIMITS
--------------------------------------------------------- */
seat_limits AS (
    SELECT train_number, coach_code, 'GEN' AS seat_type,
           CASE
               WHEN coach_code IN ('1A', 'FC') THEN total_seats
               ELSE FLOOR(total_seats * 0.60)
           END::INT AS seats
    FROM coach_capacity

    UNION ALL
    SELECT train_number, coach_code, 'RAC',
           (FLOOR(total_seats * 0.15) * 2)::INT
    FROM coach_capacity
    WHERE coach_code IN ('SL','2A','3A')

    UNION ALL
    SELECT train_number, coach_code, 'TTL',
           FLOOR(total_seats * 0.10)::INT
    FROM coach_capacity
    WHERE coach_code NOT IN ('1A', 'FC')

    UNION ALL
    SELECT train_number, coach_code, 'PTL',
           FLOOR(total_seats * 0.10)::INT
    FROM coach_capacity
    WHERE coach_code NOT IN ('1A', 'FC')

    UNION ALL
    SELECT train_number, coach_code, 'LADIES',
           FLOOR(total_seats * 0.05)::INT
    FROM coach_capacity
    WHERE coach_code NOT IN ('1A', 'FC')

    UNION ALL
    SELECT train_number, coach_code, 'PWD',
           FLOOR(total_seats * 0.05)::INT
    FROM coach_capacity
    WHERE coach_code NOT IN ('1A', 'FC')

    UNION ALL
    SELECT train_number, coach_code, 'SENIOR',
           FLOOR(total_seats * 0.05)::INT
    FROM coach_capacity
    WHERE coach_code NOT IN ('1A', 'FC')
),

/* ---------------------------------------------------------
   WAITING LIST COUNTS
--------------------------------------------------------- */
wl_counts AS (
    SELECT
        train_number,
        coach_code,
        seat_type,
        MAX(seat_sequence) AS wl_max_seq
    FROM waitinglistondate
    WHERE date_of_journey = (SELECT doj FROM params)
    GROUP BY train_number, coach_code, seat_type
),

/* ---------------------------------------------------------
   BOOKED COUNT
--------------------------------------------------------- */
seat_counts AS (
    SELECT
        train_number,
        coach_code,
        seat_type,
        COUNT(*) AS seat_count
    FROM seatsondate
    WHERE
        date_of_journey = (SELECT doj FROM params)
        AND is_booked = TRUE
    GROUP BY train_number, coach_code, seat_type
),

/* ---------------------------------------------------------
   FARE CALCULATION
--------------------------------------------------------- */
fare_calc AS (
    SELECT
        sl.train_number,
        sl.coach_code,
        sl.seat_type,
        ROUND(
             ((vt.journey_km * jf.fare_per_km) - ((vt.journey_km * jf.fare_per_km) * jf.discount_percent / 100)) + jf.flat_addon
        , 2) AS total_fare
    FROM seat_limits sl
    JOIN valid_trains vt ON vt.train_number = sl.train_number
    JOIN journey_fare jf
        ON jf.coach_code = sl.coach_code
       AND jf.seat_type  = sl.seat_type
    JOIN params p ON TRUE
),

/* ---------------------------------------------------------
   AGGREGATE DATA
--------------------------------------------------------- */
train_details AS (
    SELECT
        vt.train_number,
        vt.train_name,
        vt.train_type,
        vt.source_station,
        vt.destination_station,
        vt.departure,
        vt.arrival,
        vt.journey_duration,
        vt.journey_km,
        vt.running_days,

        /* AVAILABILITY JSON ARRAY */
        json_agg(
            json_build_object(
                'coach_code', sl.coach_code,
                'seat_type', sl.seat_type,
                'seats',
                CASE
                    WHEN wl.wl_max_seq IS NOT NULL AND wl.wl_max_seq > 0 THEN
                        'WTL' || wl.wl_max_seq::TEXT
                    ELSE
                        GREATEST(0, (sl.seats - COALESCE(sc.seat_count, 0)))::TEXT
                END,
                'fare', fc.total_fare
            ) ORDER BY sl.coach_code, sl.seat_type
        ) FILTER (WHERE sl.coach_code IS NOT NULL) AS availabilities

    FROM valid_trains vt
    LEFT JOIN seat_limits sl ON vt.train_number = sl.train_number
    LEFT JOIN wl_counts wl
        ON wl.train_number = sl.train_number
       AND wl.coach_code  = sl.coach_code
       AND wl.seat_type   = sl.seat_type
    LEFT JOIN seat_counts sc
        ON sc.train_number = sl.train_number
       AND sc.coach_code  = sl.coach_code
       AND sc.seat_type   = sl.seat_type
    LEFT JOIN fare_calc fc
        ON fc.train_number = sl.train_number
       AND fc.coach_code  = sl.coach_code
       AND fc.seat_type   = sl.seat_type

    GROUP BY
        vt.train_number,
        vt.train_name,
        vt.train_type,
        vt.source_station,
        vt.destination_station,
        vt.departure,
        vt.arrival,
        vt.journey_duration,
        vt.journey_km,
        vt.running_days
)

/* ---------------------------------------------------------
   FINAL JSON OUTPUT
--------------------------------------------------------- */
SELECT
    COALESCE(
        json_agg(
            json_build_object(
                'train_number', t.train_number,
                'train_name', t.train_name,
                'train_type', t.train_type,
                'source', t.source_station,
                'destination', t.destination_station,
                'departure', t.departure,
                'arrival', t.arrival,
                'duration', t.journey_duration,
                'km', t.journey_km,
                'running_days', t.running_days,
                'availability', t.availabilities
            )
        ),
        '[]'::json
    ) AS result
FROM train_details t;
`;
};
module.exports = getSearchQueryText;
