const getLiveStation = async (client, station_code, next_hours) => {
  const result = await client.query(
    `WITH ist_now AS (
    SELECT 
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') AS now_ist,
        CURRENT_DATE AS today_date,
        EXTRACT(DOW FROM CURRENT_DATE) AS today_dow
),

-- Step 1: Only trains running today
running_trains AS (
    SELECT t.train_number, t.train_name, t.train_type, t.station_from, t.station_to
    FROM trains t, ist_now
    WHERE 
        (today_dow = 0 AND t.train_runs_on_sun = 'Y') OR
        (today_dow = 1 AND t.train_runs_on_mon = 'Y') OR
        (today_dow = 2 AND t.train_runs_on_tue = 'Y') OR
        (today_dow = 3 AND t.train_runs_on_wed = 'Y') OR
        (today_dow = 4 AND t.train_runs_on_thu = 'Y') OR
        (today_dow = 5 AND t.train_runs_on_fri = 'Y') OR
        (today_dow = 6 AND t.train_runs_on_sat = 'Y')
),

-- Step 2: Add full timestamp for arrival/departure
sched_full AS (
    SELECT 
        s.train_number,
        s.station_code,
        s.station_name,
        s.station_sequence,
        s.arrival,
        s.departure,
        CASE WHEN s.arrival IS NOT NULL THEN (ist_now.today_date + s.arrival) END AS arr_datetime,
        CASE WHEN s.departure IS NOT NULL THEN (ist_now.today_date + s.departure) END AS dep_datetime
    FROM schedules s
    JOIN running_trains r ON s.train_number = r.train_number
    CROSS JOIN ist_now
    WHERE s.station_code = $1
),

-- Step 3: Detect midnight crossover
with_prev AS (
    SELECT 
        s.*,
        LAG(s.arrival) OVER (PARTITION BY s.train_number ORDER BY s.station_sequence) AS prev_arrival
    FROM sched_full s
),

sched_adjusted AS (
    SELECT
        train_number,
        station_code,
        station_name,
        station_sequence,
        arr_datetime + (SUM(CASE WHEN prev_arrival IS NOT NULL AND arrival < prev_arrival THEN 1 ELSE 0 END)
                        OVER (PARTITION BY train_number ORDER BY station_sequence ROWS UNBOUNDED PRECEDING)) * INTERVAL '1 day' AS arr_time_corrected,
        dep_datetime + (SUM(CASE WHEN prev_arrival IS NOT NULL AND arrival < prev_arrival THEN 1 ELSE 0 END)
                        OVER (PARTITION BY train_number ORDER BY station_sequence ROWS UNBOUNDED PRECEDING)) * INTERVAL '1 day' AS dep_time_corrected
    FROM with_prev
)

SELECT
    r.train_number,
    r.train_name,
    r.train_type,
    r.station_from,
    r.station_to,
    s.station_name,
    s.arr_time_corrected AS arrival_time,
    s.dep_time_corrected AS departure_time,
    CASE 
        WHEN s.arr_time_corrected >= (SELECT now_ist FROM ist_now) AND s.dep_time_corrected >= (SELECT now_ist FROM ist_now)
        THEN 'Yet to arrive'
        WHEN s.arr_time_corrected <= (SELECT now_ist FROM ist_now) AND s.dep_time_corrected >= (SELECT now_ist FROM ist_now)
        THEN 'Currently at station'
        ELSE 'Departed'
    END AS status,
    CASE 
        WHEN s.arr_time_corrected IS NULL OR EXTRACT(EPOCH FROM (s.arr_time_corrected - (SELECT now_ist FROM ist_now))) < 0
        THEN '-'
        ELSE 
            LPAD(FLOOR(EXTRACT(EPOCH FROM (s.arr_time_corrected - (SELECT now_ist FROM ist_now))) / 3600)::TEXT, 2, '0')
            || ':' ||
            LPAD(FLOOR(MOD(EXTRACT(EPOCH FROM (s.arr_time_corrected - (SELECT now_ist FROM ist_now))), 3600) / 60)::TEXT, 2, '0')
    END AS eta_hhmm
FROM sched_adjusted s
JOIN running_trains r ON s.train_number = r.train_number
WHERE s.arr_time_corrected BETWEEN (SELECT now_ist FROM ist_now) 
                               AND ((SELECT now_ist FROM ist_now) + ($2 || ' hours')::interval)
ORDER BY s.arr_time_corrected ASC;
`,
    [station_code.toUpperCase(), next_hours]
  );
  if (0 === result.rows.length) {
    return {
      trains_list: result.rows,
      message: "No trains found!",
    };
  } else {
    return {
      trains_list: result.rows,
      message: "Trains list fetched successfully!",
    };
  }
};
module.exports = getLiveStation;
