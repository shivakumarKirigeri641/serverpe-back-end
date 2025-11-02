const getLiveTrainRunningInformation = async (client, train_number) => {
  const result = await client.query(
    `WITH
ist_now AS (
    SELECT 
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') AS now_ist,
        CURRENT_DATE AS today_date,
        EXTRACT(DOW FROM (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'))::int AS today_dow
),

running_train AS (
    SELECT 
        t.train_number,
        CASE
            WHEN (ist.today_dow = 0 AND t.train_runs_on_sun = 'Y') OR
                 (ist.today_dow = 1 AND t.train_runs_on_mon = 'Y') OR
                 (ist.today_dow = 2 AND t.train_runs_on_tue = 'Y') OR
                 (ist.today_dow = 3 AND t.train_runs_on_wed = 'Y') OR
                 (ist.today_dow = 4 AND t.train_runs_on_thu = 'Y') OR
                 (ist.today_dow = 5 AND t.train_runs_on_fri = 'Y') OR
                 (ist.today_dow = 6 AND t.train_runs_on_sat = 'Y')
            THEN TRUE ELSE FALSE
        END AS runs_today
    FROM trains t
    CROSS JOIN ist_now ist
    WHERE t.train_number = $1
),

schedule_with_ts AS (
    SELECT 
        s.train_number,
        s.station_sequence,
        s.station_code,
        s.station_name,
        s.kilometer,
        s.arrival,
        s.departure,
        ist.today_date + s.arrival AS arrival_ts_base,
        ist.today_date + s.departure AS departure_ts_base
    FROM schedules s
    CROSS JOIN ist_now ist
    WHERE s.train_number = (SELECT train_number FROM running_train)
),
schedule_ordered AS (
    SELECT *,
        arrival_ts_base + 
            (CASE WHEN arrival_ts_base < LAG(departure_ts_base) OVER (ORDER BY station_sequence)
                  THEN INTERVAL '1 day' ELSE INTERVAL '0' END) AS arrival_ts,
        departure_ts_base + 
            (CASE WHEN departure_ts_base < LAG(departure_ts_base) OVER (ORDER BY station_sequence)
                  THEN INTERVAL '1 day' ELSE INTERVAL '0' END) AS departure_ts
    FROM schedule_with_ts
    ORDER BY station_sequence
),
bounds AS (
    SELECT MIN(arrival_ts) AS first_arrival,
           MAX(departure_ts) AS last_departure
    FROM schedule_ordered
),
last_departed AS (
    SELECT *
    FROM schedule_ordered
    WHERE departure_ts <= (SELECT now_ist FROM ist_now)
    ORDER BY station_sequence DESC
    LIMIT 1
),
next_arrival AS (
    SELECT *
    FROM schedule_ordered so
    WHERE so.station_sequence > (SELECT station_sequence FROM last_departed)
    ORDER BY station_sequence ASC
    LIMIT 1
)

SELECT
    rt.train_number,
    rt.runs_today,
    
    -- Dynamic train status
    CASE
        WHEN NOT rt.runs_today THEN 'Train won''t run today'
        WHEN (SELECT now_ist FROM ist_now) < (SELECT first_arrival FROM bounds) THEN 'Yet to Start'
        WHEN ld.station_sequence = (SELECT MAX(station_sequence) FROM schedule_ordered) THEN 'Train reached its destination'
        WHEN na.station_code IS NULL THEN 'Completed'
        WHEN GREATEST(0, na.kilometer - ld.kilometer - 
               (EXTRACT(EPOCH FROM ((SELECT now_ist FROM ist_now) - ld.departure_ts)) / 
                EXTRACT(EPOCH FROM (na.arrival_ts - ld.departure_ts))
               ) * (na.kilometer - ld.kilometer)
             ) = 0 THEN 'Arrived at next station'
        ELSE 'In Transit'
    END AS train_status,

    -- Last departed station
    ld.station_code AS last_departed_station_code,
    ld.station_name AS last_departed_station_name,
    TO_CHAR(ld.departure_ts, 'YYYY-MM-DD HH24:MI:SS') AS last_departed_time,
    ld.kilometer AS km_last_departed,

    -- Next arrival station
    na.station_code AS next_arrival_station_code,
    na.station_name AS next_arrival_station_name,
    TO_CHAR(na.arrival_ts, 'YYYY-MM-DD HH24:MI:SS') AS next_arrival_time,
    na.kilometer AS km_next_arrival,

    -- Total distance between last departed and next arrival
    na.kilometer - ld.kilometer AS km_between_stations,

    -- Distance already covered from last departed to next arrival
    CASE
        WHEN na.arrival_ts IS NOT NULL AND ld.departure_ts IS NOT NULL
             AND (SELECT now_ist FROM ist_now) >= ld.departure_ts
        THEN LEAST(
             (EXTRACT(EPOCH FROM ((SELECT now_ist FROM ist_now) - ld.departure_ts)) / 
              EXTRACT(EPOCH FROM (na.arrival_ts - ld.departure_ts))
             ) * (na.kilometer - ld.kilometer),
             na.kilometer - ld.kilometer
        )
        ELSE 0
    END AS km_ran_from_last_departed,

    -- Remaining distance to next arrival
    CASE
        WHEN na.kilometer IS NOT NULL AND ld.kilometer IS NOT NULL
        THEN GREATEST(0, na.kilometer - ld.kilometer - 
              (EXTRACT(EPOCH FROM ((SELECT now_ist FROM ist_now) - ld.departure_ts)) / 
               EXTRACT(EPOCH FROM (na.arrival_ts - ld.departure_ts))
              ) * (na.kilometer - ld.kilometer)
        )
        ELSE NULL
    END AS km_remaining_to_next,

    -- ETA to next arrival (hours & minutes)
    CASE 
        WHEN na.arrival_ts IS NOT NULL AND (SELECT now_ist FROM ist_now) < na.arrival_ts
        THEN FLOOR(EXTRACT(EPOCH FROM (na.arrival_ts - (SELECT now_ist FROM ist_now))) / 3600)
        ELSE 0
    END AS eta_hours,

    CASE 
        WHEN na.arrival_ts IS NOT NULL AND (SELECT now_ist FROM ist_now) < na.arrival_ts
        THEN FLOOR(MOD(EXTRACT(EPOCH FROM (na.arrival_ts - (SELECT now_ist FROM ist_now))), 3600) / 60)
        ELSE 0
    END AS eta_minutes

FROM running_train rt
LEFT JOIN last_departed ld ON TRUE
LEFT JOIN next_arrival na ON TRUE;


`,
    [train_number]
  );
  if (0 === result.rows.length) {
    return {
      trains_list: result.rows,
      message: "No trains found!",
    };
  } else {
    return {
      trains_list: result.rows,
      message: "Trains details fetched successfully!",
    };
  }
};
module.exports = getLiveTrainRunningInformation;
