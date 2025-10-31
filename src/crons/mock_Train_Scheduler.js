// cronTask.js
const runSimulator_sl = require("../SQL/insertion/booking_simulator/runSimulator_sl");
const runSimulator_1a = require("../SQL/insertion/booking_simulator/runSimulator_1a");
const runSimulator_2a = require("../SQL/insertion/booking_simulator/runSimulator_2a");
const runSimulator_3a = require("../SQL/insertion/booking_simulator/runSimulator_3a");
const runSimulator_2s = require("../SQL/insertion/booking_simulator/runSimulator_2s");
const runSimulator_cc = require("../SQL/insertion/booking_simulator/runSimulator_cc");
const runSimulator_ec = require("../SQL/insertion/booking_simulator/runSimulator_ec");
const runSimulator_ea = require("../SQL/insertion/booking_simulator/runSimulator_ea");
const runSimulator_e3 = require("../SQL/insertion/booking_simulator/runSimulator_e3");
const runSimulator_fc = require("../SQL/insertion/booking_simulator/runSimulator_fc");
const fs = require("fs");
const cron = require("node-cron");
const { connectDB } = require("../database/connectDB");
const getPostgreClient = require("../SQL/getPostgreClient");
const { setTimeout } = require("timers/promises");
async function runReservationSimulator() {
  console.log("Running task at:", new Date().toLocaleString());
  // 👉 Your method logic here
  try {
    const pool = await connectDB();
    await runSimulator_1a(pool);
    console.log("finished 1a");
    await runSimulator_2a(pool);
    console.log("finished 2a");
    await runSimulator_3a(pool);
    console.log("finished ea");
    await runSimulator_2s(pool);
    console.log("finished 2s");
    await runSimulator_sl(pool);
    console.log("finished sl");
    await runSimulator_ea(pool);
    console.log("finished ea");
    await runSimulator_ec(pool);
    console.log("finished ec");
    await runSimulator_e3(pool);
    console.log("finished e3");
    await runSimulator_fc(pool);
    console.log("finished fc");
  } catch (err) {
    console.log(err.message);
  } finally {
  }
}
// ✅ Get IST time safely
function getIndianHour() {
  const indiaTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  return new Date(indiaTime).getHours();
}
// ✅ Infinite loop that runs only from 6 AM – 10:59 PM IST
async function startInfiniteLoop() {
  console.log("🚀 Continuous runner started (6 AM – 10:59 PM IST)");

  while (true) {
    const hour = getIndianHour();

    if (hour >= 6 && hour < 23) {
      try {
        await runReservationSimulator(); // keep running continuously
      } catch (err) {
        console.error("❌ Error in runSimulator:", err);
        await setTimeout(5000); // wait a bit before retrying if error
      }
    } else {
      console.log("🌙 Paused — outside working hours (11 PM – 6 AM IST)");
      await setTimeout(5 * 60 * 1000); // sleep 5 minutes before checking again
    }
  }
}
// ✅ Start it
startInfiniteLoop();

//runs at 12:01am daily
cron.schedule(
  "2 0 * * *",
  async () => {
    let client = null;
    try {
      const pool = await connectDB();
      client = await pool.connect();
      await client.query("BEGIN");
      backup_remove_newSeats(client); //runs in every 24hrs
      console.log("backup successfull");
      await insertNewSeats_sl(client);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      console.log(err.message);
    } finally {
      await client.release();
    }
  },
  {
    timezone: "Asia/Kolkata", // optional: set timezone
  }
);
const backup_remove_newSeats = async (client) => {
  try {
    //first backup
    await backup(client);
    //remove yesterday entry
    await removePreviousDatEntries(client);
    //insert new entry which must be exactly 60days from now
    await insertNewSeats_sl(client);
  } catch (err) {
    console.log(err.message);
  } finally {
  }
};
const backup = async (client) => {
  //try backup
  const today = new Date();

  // Subtract 1 day
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const year = yesterday.getFullYear();
  const month = yesterday.getMonth() + 1; // months are 0-based
  const day = yesterday.getDate();

  const formattedDate = `${year}-${month}-${day}`;
  const result =
    await client.query(`select b.*, sa.*, p.* from bookingdata b join
  passengerdata p on b.id = p.fkbookingdata join
  seatallocation_sl sa on sa.fkpassengerdata = p.id
  where b.date_of_journey= CURRENT_DATE;`);
  if (0 < result.rows.length) {
    const csv = [
      Object.keys(result.rows[0]).join(","), // header
      ...result.rows.map((r) => Object.values(r).join(",")), // rows
    ].join("\n");
    fs.writeFileSync(formattedDate + "_backup.csv", csv);
    console.log("Backup saved!");
  } else {
    console.log("no backup found");
  }
};
const removePreviousDatEntries = async (client) => {
  //try backup

  await client.query(`
    DO $$
DECLARE
    target_date DATE := CURRENT_DATE - INTERVAL '1 day';
    table_name TEXT;
BEGIN
    -- Delete from dependent table first
    DELETE FROM passengerdata
    WHERE fkbookingdata IN (
        SELECT id FROM bookingdata WHERE date_of_journey = target_date
    );

    -- Then delete parent
    DELETE FROM bookingdata WHERE date_of_journey = target_date;

    -- List of seat tables to loop
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'seatsondate_sl', 'seatsondate_3a', 'seatsondate_2a',
            'seatsondate_1a', 'seatsondate_cc', 'seatsondate_ec',
            'seatsondate_ea', 'seatsondate_e3', 'seatsondate_fc', 'seatsondate_2s'
        ])
    LOOP
        EXECUTE format('DELETE FROM %I WHERE date_of_journey = %L', table_name, target_date);
    END LOOP;
END $$;

`);
  console.log("previous days entries removed!");
};
const insertNewSeats_sl = async (client) => {
  //try backup

  await client.query(`WITH target_date AS (
    SELECT (CURRENT_DATE + INTERVAL '60 day')::date AS date_of_journey
),
sl_trains AS (
    SELECT 
        train_number,
        bogi_count_sl AS bogi_count
    FROM coaches
    WHERE sl = 'Y'
)
INSERT INTO seatsondate_sl (
    train_number,
    date_of_journey,
    total_seats,
    gen_count,
    rac_count,
    rac_share_count,
    ttl_count,
    ptl_count,
    ladies_count,
    duty_count,
    senior_count,
    pwd_count
)
SELECT 
    t.train_number,
    td.date_of_journey,
    t.bogi_count * 72 AS total_seats,         
    ROUND(t.bogi_count * 72 * 0.70) AS gen_count,      
    ROUND(t.bogi_count * 72 * 0.10) AS rac_count,      
    ROUND(t.bogi_count * 72 * 0.10) AS rac_share_count,
    ROUND(t.bogi_count * 72 * 0.05) AS ttl_count,      
    ROUND(t.bogi_count * 72 * 0.05) AS ptl_count,      
    ROUND(t.bogi_count * 72 * 0.03) AS ladies_count,   
    ROUND(t.bogi_count * 72 * 0.02) AS duty_count,     
    ROUND(t.bogi_count * 72 * 0.03) AS senior_count,   
    ROUND(t.bogi_count * 72 * 0.02) AS pwd_count       
FROM sl_trains t
CROSS JOIN target_date td
WHERE NOT EXISTS (
    SELECT 1 
    FROM seatsondate_sl s 
    WHERE s.train_number = t.train_number 
      AND s.date_of_journey = td.date_of_journey
)
ORDER BY t.train_number;
`);
  console.log("new seats entry included.!");
};
