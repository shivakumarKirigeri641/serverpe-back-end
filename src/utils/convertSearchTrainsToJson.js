const convertSearchTrainsToJson = (result_search_trains) => {
  const rows = result_search_trains.rows;

  // 1. Create a map of dates
  const journeyMap = {};
  const allDates = [
    ...new Set(rows.map((r) => r.date_of_journey.toISOString().split("T")[0])),
  ];

  allDates.forEach((date) => {
    journeyMap[date] = [];
  });

  // 2. Group by train and fill per date
  const trainMap = {};
  rows.forEach((row) => {
    const date = row.date_of_journey.toISOString().split("T")[0];
    const trainKey = row.train_number;

    if (!trainMap[trainKey]) {
      trainMap[trainKey] = {
        train_number: row.train_number,
        train_name: row.train_name,
        train_type: row.train_type,
        train_origin: row.train_origin,
        train_destination: row.train_destination,
        scheduled_departure: row.scheduled_departure,
        estimated_destination_arrival: row.estimated_destination_arrival,
        distance: row.distance,
        seats_by_date: {},
      };
    }

    trainMap[trainKey].seats_by_date[date] = {
      sl_gen: row.sl_gen,
      sl_ttl: row.sl_ttl,
      sl_ptl: row.sl_ptl,
      sl_ladies: row.sl_ladies,
      sl_pwd: row.sl_pwd,
      sl_rac: row.sl_rac,
      sl_duty: row.sl_duty,
      sl_senior: row.sl_senior,
      sl_waiting: row.sl_waiting,
      a3_gen: row.a3_gen,
      a3_ttl: row.a3_ttl,
      a3_ptl: row.a3_ptl,
      a3_ladies: row.a3_ladies,
      a3_pwd: row.a3_pwd,
      a3_rac: row.a3_rac,
      a3_duty: row.a3_duty,
      a3_senior: row.a3_senior,
      a3_waiting: row.a3_waiting,
    };
  });

  // 3. Build final JSON array by dates
  const finalJson = allDates.map((date) => {
    const trains = Object.values(trainMap).map((train) => {
      return {
        ...train,
        seats: train.seats_by_date[date] || null,
      };
    });

    return {
      date,
      trains,
    };
  });

  return finalJson; // ✅ return JSON object instead of console.log
};

module.exports = convertSearchTrainsToJson;
