const getSchedules = async (
  client,
  train_number,
  source_code = null,
  destination_code = null
) => {
  try {
    /**
     * throw {
      status: 400,
      success: false,
      message: "Missing authorization header!",
      data: {},
    };
     */

    const result_train_details = await client.query(
      `SELECT 
    s.station_sequence as stops,
    s.station_code,
    st.station_name,
    COALESCE(TO_CHAR(s.arrival::time, 'HH24:MI'), '-') AS arrival,
    COALESCE(TO_CHAR(s.departure::time, 'HH24:MI'), '-') AS departure,
    s.kilometer, s.running_day,
     CASE 
        WHEN s.arrival IS NULL OR s.departure IS NULL THEN '-'
        WHEN (s.departure::time - s.arrival::time) < interval '0' 
            THEN CONCAT(ROUND(EXTRACT(EPOCH FROM ((s.departure::time + interval '24 hour') - s.arrival::time)) / 60), ' min')
        ELSE CONCAT(ROUND(EXTRACT(EPOCH FROM (s.departure::time - s.arrival::time)) / 60), ' min')
    END AS halt_duration,
	CASE 
        WHEN s.station_code IN ($2, $3) THEN true 
        ELSE false 
    END AS is_selected_station
FROM public.schedules s
JOIN stations st ON s.station_code = st.code
JOIN trains t ON t.train_number = s.train_number
WHERE s.train_number = $1
ORDER BY s.station_sequence;
`,
      [train_number, source_code, destination_code]
    );
    if (0 === result_train_details.rows.length) {
      throw {
        status: 400,
        success: false,
        message: "Schedule information not found!",
        data: {},
      };
    } else {
      return result_train_details.rows;
    }
  } catch (err) {
    throw err;
  }
};
module.exports = getSchedules;
