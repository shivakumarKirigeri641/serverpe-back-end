const { Pool, types } = require("pg");
require("dotenv").config();

// Keep DATE as string (no timezone changes)
types.setTypeParser(1082, (val) => val);
let poolmain = null;
let poolTrain = null;

// 🔥 Common function to test pool connection once
function testConnection(pool, label) {
  pool
    .query("SELECT NOW()")
    .then(() => console.log(`✅ PostgreSQL connected: ${label}`))
    .catch((err) => console.error(`❌ Connection failed for ${label}`, err));
}
/* ============================================
   MAIN DB (PGDATABASEMAIN)
============================================ */
const connectMainDB = () => {
  if (!poolmain) {
    poolmain = new Pool({
      host: process.env.PGHOST,
      database: process.env.PGDATABASEMAIN,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      keepAlive: true,
    });

    testConnection(poolmain, "MAIN DB");
  }
  return poolmain;
};
/* ============================================
   TRAIN SEAT DB (PGDATABASEMOCKTRAINTICKETS)
============================================ */
const connectTrainSeatDb = () => {
  if (!poolTrain) {
    poolTrain = new Pool({
      host: process.env.PGHOST,
      database: process.env.PGDATABASEMOCKTRAINTICKETS,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      keepAlive: true,
    });

    testConnection(poolTrain, "Connected to TRAIN SEAT DB");
  }
  return poolTrain;
};

module.exports = {
  connectMainDB,
  connectTrainSeatDb,
  connectMockTrainTicketsDb: connectTrainSeatDb, // Alias for train.repo.js compatibility
  getMainPool: () => poolmain,
  getTrainPool: () => poolTrain
};
