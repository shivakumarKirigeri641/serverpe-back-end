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
        END AS runs_today,
        -- Calculate correct origin date based on running_day of first station
        CURRENT_DATE - ((s.running_day - 1) * INTERVAL '1 day') AS origin_date
    FROM trains t
    CROSS JOIN ist_now ist
    JOIN schedules s 
        ON t.train_number = s.train_number 
       AND s.station_sequence = 1
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
        s.running_day,
        rt.origin_date,
        -- Arrival and departure timestamps based on running_day
        rt.origin_date + (s.running_day - 1) * INTERVAL '1 day' + s.arrival AS arrival_ts,
        rt.origin_date + (s.running_day - 1) * INTERVAL '1 day' + s.departure AS departure_ts
    FROM schedules s
    JOIN running_train rt ON s.train_number = rt.train_number
),

-- Last departed station (before now)
last_departed AS (
    SELECT *
    FROM schedule_with_ts
    WHERE departure_ts <= (SELECT now_ist FROM ist_now)
    ORDER BY station_sequence DESC
    LIMIT 1
),

-- Next station after last departed
next_arrival AS (
    SELECT *
    FROM schedule_with_ts so
    WHERE so.station_sequence > (SELECT station_sequence FROM last_departed)
    ORDER BY station_sequence ASC
    LIMIT 1
)

SELECT
    so.station_sequence,
    so.station_code,
    so.station_name,
    TO_CHAR(so.arrival_ts, 'YYYY-MM-DD HH24:MI:SS') AS arrival_time,
    TO_CHAR(so.departure_ts, 'YYYY-MM-DD HH24:MI:SS') AS departure_time,
    so.kilometer,

    rt.train_number,
    rt.runs_today,

    -- Train status at this station
    CASE
        WHEN NOT rt.runs_today THEN 'Train won''t run today'
        WHEN so.station_sequence = 1 AND (SELECT now_ist FROM ist_now) < so.departure_ts THEN 'Yet to Start'
        WHEN so.station_sequence = (SELECT MAX(station_sequence) FROM schedule_with_ts) 
             AND (SELECT now_ist FROM ist_now) >= so.departure_ts THEN 'Train reached its destination'
        WHEN (SELECT now_ist FROM ist_now) >= so.departure_ts THEN 'Departed'
        WHEN (SELECT now_ist FROM ist_now) >= so.arrival_ts THEN 'Arrived'
        ELSE 'Yet to Arrive'
    END AS train_status_at_station,

    -- Distance ran from last departed station
    CASE
        WHEN (SELECT now_ist FROM ist_now) >= (SELECT departure_ts FROM last_departed)
             AND so.station_sequence > (SELECT station_sequence FROM last_departed)
        THEN so.kilometer - (SELECT kilometer FROM last_departed)
        ELSE 0
    END AS km_ran_from_last_departed,

    -- Remaining km to next station
    CASE
        WHEN so.station_sequence = (SELECT station_sequence FROM last_departed)
             AND (SELECT station_sequence FROM next_arrival) IS NOT NULL
        THEN (SELECT kilometer FROM next_arrival) - (SELECT kilometer FROM last_departed)
        ELSE 0
    END AS km_remaining_to_next,

    -- ETA to this station from now
    CASE 
        WHEN (SELECT now_ist FROM ist_now) < so.arrival_ts
        THEN FLOOR(EXTRACT(EPOCH FROM (so.arrival_ts - (SELECT now_ist FROM ist_now))) / 3600)
        ELSE 0
    END AS eta_hours,

    CASE 
        WHEN (SELECT now_ist FROM ist_now) < so.arrival_ts
        THEN FLOOR(MOD(EXTRACT(EPOCH FROM (so.arrival_ts - (SELECT now_ist FROM ist_now))), 3600) / 60)
        ELSE 0
    END AS eta_minutes

FROM schedule_with_ts so
CROSS JOIN running_train rt
ORDER BY so.station_sequence;
`,
    [train_number]
  );
  if (0 === result.rows.length) {
    return {
      trains_list: result.rows,
      message: "Train details not found!",
    };
  } else {
    return {
      trains_list: result.rows,
      message: "Trains details fetched successfully!",
    };
  }
};
module.exports = getLiveTrainRunningInformation;
