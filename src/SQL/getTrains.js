const getTrains = async (client, source_code, destination_code) => {
  try {
    result = await client.query(
      `select t.train_number, t.train_name, s1.arrival, s1.departure, s1.station_name as from_station, (s2.kilometer - s1.kilometer) as km, round((s2.kilometer - s1.kilometer)*0.3) as base_fare,
t.station_from as train_source, t.station_to as train_destination,
s2.station_name as to_station, s1.station_code as pass_from, s2.station_code as pass_to from schedules s1 join schedules s2 on s1.train_number = s2.train_number join
trains t on t.train_number = s1.train_number join coaches c on c.train_number = t.train_number
where
s1.station_code = $1 and 
s2.station_code=$2 and 
c.gen=$3 and 
(
        ( ((current_time AT TIME ZONE 'UTC' + interval '5 hours 30 minutes')::time + interval '2 hours') <= '24:00'::time
          AND s1.arrival > (current_time AT TIME ZONE 'UTC' + interval '5 hours 30 minutes')::time
          AND s1.arrival <= ((current_time AT TIME ZONE 'UTC' + interval '5 hours 30 minutes')::time + interval '2 hours')
        )
     OR
        ( ((current_time AT TIME ZONE 'UTC' + interval '5 hours 30 minutes')::time + interval '2 hours') > '24:00'::time
          AND (
              s1.arrival > (current_time AT TIME ZONE 'UTC' + interval '5 hours 30 minutes')::time
              OR s1.arrival <= (((current_time AT TIME ZONE 'UTC' + interval '5 hours 30 minutes')::time + interval '2 hours') - '24:00'::interval)::time
          )
        )

) and
s1.station_sequence <s2.station_sequence
order by s1.arrival`,
      [source_code, destination_code, "Y"]
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
module.exports = getTrains;
