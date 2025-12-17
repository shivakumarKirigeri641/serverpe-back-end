const getTrainSchedule = async (
  client,
  train_number,
  source_code = null,
  destination_code = null
) => {
  //check train_number
  let result_train_schedule_details = await client.query(
    `select distinct station_sequence, kilometer, station_code, station_name, arrival, departure, running_day from schedules where train_number=$1 order by station_sequence`,
    [train_number]
  );
  if (0 === result_train_schedule_details.rows.length) {
    return {
      statuscode: 422,
      successstatus: false,
      message: "Train number not found!",
    };
  }
  //fetch train_details
  const result_train_details = await client.query(
    `select train_number, train_name, train_type, zone, station_from, station_to, train_runs_on_mon, train_runs_on_tue, train_runs_on_wed, train_runs_on_thu, train_runs_on_fri, train_runs_on_sat, train_runs_on_sun from trains where train_number=$1`,
    [train_number]
  );
  let updated_train_schedule = [];
  if (source_code && destination_code) {
    result_train_schedule_details.rows = result_train_schedule_details.rows.map(
      (item) => ({
        ...item,
        stop:
          item.station_code === source_code ||
          item.station_code === destination_code
            ? true
            : false,
      })
    );
  }
  return {
    train_details: result_train_details.rows[0],
    train_schedule_details: result_train_schedule_details.rows,
  };
};
module.exports = getTrainSchedule;
