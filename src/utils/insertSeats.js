const insertSeats = async (client) => {
  const startDate = new Date(); // today
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 2); // 2 months later

  let currentDate = new Date(startDate);

  let resulttrains = await client.query(
    "select distinct train_number from coaches where a_1=$1 or a_2=$2 or a_3=$3 or sl=$4 or cc=$5 or ec=$6 or fc=$7 or e_3=$8 or ea=$9",
    ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"]
  );
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD

    for (let j = 0; j < resulttrains.rows.length; j++) {
      await client.query(
        "INSERT INTO seatsondate(train_number, date_of_journey) VALUES($1, $2) ON CONFLICT DO NOTHING",
        [resulttrains.rows[j].train_number, dateStr]
      );
    }
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
};
module.exports = insertSeats;
