const populateSeatsSL = async (client) => {
  try {
    // Get all trains with their sleeper coach counts
    const trainsRes = await client.query(`
            SELECT train_number, bogi_count
            FROM coach_ea
        `);

    // Dates: from tomorrow till 2 months from today
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // tomorrow
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 2);

    for (const row of trainsRes.rows) {
      const trainNumber = row.train_number;
      const bogiCount = parseInt(row.bogi_count);

      // Loop over each coach
      for (let coachNum = 1; coachNum <= bogiCount; coachNum++) {
        let currentDate = new Date(startDate);

        // Loop over dates
        while (currentDate <= endDate) {
          console.log(
            "inserting train:",
            row.train_number,
            ", date:",
            currentDate
          );
          const journeyDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
          const coachCode = "EA";

          // Insert into seats_sl with NULL seats
          const seatColumns = Array.from(
            { length: 60 },
            (_, i) => `seat_${i + 1}`
          ).join(", ");
          const seatValues = Array(60).fill("NULL").join(", ");

          const insertQuery = `
                        INSERT INTO seats_ea (train_number, date_of_journey, coach_code, coach_number, ${seatColumns})
                        VALUES ($1, $2, $3, $4, ${seatValues})
                    `;

          await client.query(insertQuery, [
            trainNumber,
            journeyDate,
            coachCode,
            coachNum,
          ]);

          // Move to next date
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    console.log("Seats pre-populated successfully.");
  } catch (err) {
    console.error("Error populating seats:", err);
  } finally {
  }
};
module.exports = populateSeatsSL;
