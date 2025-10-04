const simulatBookTickets = async (client) => {
  try {
    //normal booking
    // Current date
    const result_trains = await client.query(
      "select distinct train_number from coaches"
    );
    const today = new Date();

    // Day after tomorrow
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(today.getDate() + 2);

    // Start date: 2 months from now
    let currentDate = new Date();
    currentDate.setMonth(today.getMonth() + 2);

    // Loop backwards from 2 months later to day after tomorrow
    while (currentDate >= dayAfterTomorrow) {
      console.log(currentDate.toISOString().split("T")[0]); // YYYY-MM-DD

      for (let i = 0; i < result_trains.rows.length; i++) {}
      // Go to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    }
    //tatkal booking
  } catch (err) {
    throw err;
  }
};
module.exports = simulatBookTickets;
