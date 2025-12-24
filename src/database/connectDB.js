const { Pool, types } = require("pg");
require("dotenv").config();

// Keep DATE as string (no timezone changes)
types.setTypeParser(1082, (val) => val);

// Global pools (created only once)
let pool = null;
let poolpincode = null;
let poolcaspecs = null;
let poolbikepecs = null;
let poolmain = null;

// 🔥 Common function to test pool connection once
function testConnection(pool, label) {
  pool
    .query("SELECT NOW()")
    .then(() => console.log(`✅ PostgreSQL connected: ${label}`))
    .catch((err) => console.error(`❌ Connection failed for ${label}`, err));
}

/* ============================================
   DEFAULT DB (PGDATABASE)
============================================ */
const connectMockTrainTicketsDb = () => {
  try {
    if (!pool) {
      pool = new Pool({
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

      testConnection(pool, "Mock train tickets DB");
    }
    return pool;
  } catch (err) {
    console.log("error in mocktrain db:", err.message);
  }
};
/* ============================================
   DEFAULT DB (CARSPECS)
============================================ */
const connectCarSpecsDB = () => {
  try {
    if (!poolcaspecs) {
      poolcaspecs = new Pool({
        host: process.env.PGHOST,
        database: process.env.PGDATABASECARSPECS,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        keepAlive: true,
      });

      testConnection(poolcaspecs, "CARSPECS DB");
    }
    return poolcaspecs;
  } catch (err) {
    console.log("error in carspec db:", err.message);
  }
};
/* ============================================
   DEFAULT DB (BIKESPEC)
============================================ */
const connectBikeSpecsDB = () => {
  try {
    if (!poolbikepecs) {
      poolbikepecs = new Pool({
        host: process.env.PGHOST,
        database: process.env.PGDATABASEBIKESPECS,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        keepAlive: true,
      });

      testConnection(poolbikepecs, "BIKESPECS DB");
    }
    return poolbikepecs;
  } catch (err) {
    console.log("error in bikespec db:", err.message);
  }
};

/* ============================================
   PINCODE DB (PGDATABASEPINCODES)
============================================ */
const connectPinCodeDB = () => {
  try {
    if (!poolpincode) {
      poolpincode = new Pool({
        host: process.env.PGHOST,
        database: process.env.PGDATABASEPINCODES,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        keepAlive: true,
      });

      testConnection(poolpincode, "PINCODE DB");
    }
    return poolpincode;
  } catch (err) {
    console.log("error in mocktrain db:", err.message);
  }
};

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

module.exports = {
  connectMockTrainTicketsDb,
  connectPinCodeDB,
  connectCarSpecsDB,
  connectMainDB,
  connectBikeSpecsDB,
};
