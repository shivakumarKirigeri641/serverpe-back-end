// cronTask.js
const cron = require("node-cron");
// Schedule cron: At 12:01 AM every day
cron.schedule(
  "0 1 * * *",
  () => {
    alloateNewSeats();
  },
  {
    timezone: "Asia/Kolkata", // optional: set timezone
  }
);
const alloateNewSeats = () => {
  console.log("test cron every minute");
};
