const getSourceAndDestination = async (client, train_number) => {
  const result_schedule = await client.query(
    `WITH valid_pairs AS (
    SELECT 
        s1.station_code AS source_code,
        s2.station_code AS destination_code,
        (s2.kilometer - s1.kilometer) AS distance_km
    FROM schedules s1
    JOIN schedules s2 
        ON s1.train_number = s2.train_number
        AND s2.station_sequence > s1.station_sequence
        AND (s2.kilometer - s1.kilometer) >= 200
    WHERE s1.train_number = $1
)
SELECT 
    COALESCE(vp.source_code, first_station.station_code) AS source_code,
    COALESCE(vp.destination_code, last_station.station_code) AS destination_code
FROM (
    SELECT * FROM valid_pairs ORDER BY RANDOM() LIMIT 1
) vp
RIGHT JOIN (SELECT 
                (SELECT station_code FROM schedules WHERE train_number = $1 ORDER BY station_sequence LIMIT 1) AS station_code
            ) first_station ON true
RIGHT JOIN (SELECT 
                (SELECT station_code FROM schedules WHERE train_number = $1 ORDER BY station_sequence DESC LIMIT 1) AS station_code
            ) last_station ON true;
`,
    [train_number]
  );
  return {
    source_code: result_schedule.rows[0].source_code,
    destination_code: result_schedule.rows[0].destination_code,
  };
};
module.exports = getSourceAndDestination;
