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
// Schedule cron: At 12:01 AM every day
cron.schedule(
  "* * * * *",
  async () => {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    try {
      await runSimulator_2a(pool, client);
      await runSimulator_1a(pool, client);
      await runSimulator_2s(pool, client);
      await runSimulator_cc(pool, client);
      await runSimulator_ec(pool, client);
      await runSimulator_e3(pool, client);
      await runSimulator_ea(pool, client);
      await runSimulator_fc(pool, client);
      await runSimulator_sl(pool, client);
      await runSimulator_3a(pool, client);
    } catch (err) {
      console.log(err.message);
    }
  },
  {
    timezone: "Asia/Kolkata", // optional: set timezone
  }
);
//runs at 12:01am daily
cron.schedule(
  "2 0 * * *",
  async () => {
    const pool = await connectDB();
    client = await getPostgreClient(pool);
    try {
      backup_remove_newSeats(client); //runs in every 24hrs
      console.log("backup successfull");
    } catch (err) {
      console.log(err.message);
    }
  },
  {
    timezone: "Asia/Kolkata", // optional: set timezone
  }
);
const backup_remove_newSeats = async (client) => {
  //first backup
  await backup(client);
  //remove yesterday entry
  await removePreviousDatEntries(client);
  //insert new entry which must be exactly 60days from now
  await insertNewSeats_sl(client);
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

  await client.query(`DO $$
DECLARE
    yesterday DATE := CURRENT_DATE - 1;
BEGIN
    -- 1️⃣ Delete child tables first
    DELETE FROM passengerdata
    WHERE fkbookingdata IN (
        SELECT id FROM bookingdata
        WHERE date_of_journey = yesterday
    );

    -- 2️⃣ Delete parent tables
    DELETE FROM bookingdata
    WHERE date_of_journey = yesterday;

    -- 3️⃣ Delete seatsondate tables
    DELETE FROM seatsondate_sl WHERE date_of_journey = yesterday;
    DELETE FROM seatsondate_3a WHERE date_of_journey = yesterday;
    DELETE FROM seatsondate_2a WHERE date_of_journey = yesterday;
    DELETE FROM seatsondate_1a WHERE date_of_journey = yesterday;
    DELETE FROM seatsondate_cc WHERE date_of_journey = yesterday;
    DELETE FROM seatsondate_ec WHERE date_of_journey = yesterday;
    DELETE FROM seatsondate_ea WHERE date_of_journey = yesterday;
    DELETE FROM seatsondate_e3 WHERE date_of_journey = yesterday;
    DELETE FROM seatsondate_fc WHERE date_of_journey = yesterday;
    DELETE FROM seatsondate_2s WHERE date_of_journey = yesterday;

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
