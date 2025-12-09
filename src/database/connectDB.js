const { Pool, types } = require("pg");
require("dotenv").config();

// Keep DATE as string (no timezone changes)
types.setTypeParser(1082, (val) => val);

// Global pools (created only once)
let pool = null;
let poolpincode = null;
let poolifsc = null;
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
};
/* ============================================
   DEFAULT DB (CARSPECS)
============================================ */
const connectCarSpecsDB = () => {
  if (!pool) {
    pool = new Pool({
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

    testConnection(pool, "DEFAULT DB");
  }
  return pool;
};

/* ============================================
   PINCODE DB (PGDATABASEPINCODES)
============================================ */
const connectPinCodeDB = () => {
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
};

/* ============================================
   IFSC DB (PGDATABASEIFSC)
============================================ */
const connectIFSCDB = () => {
  if (!poolifsc) {
    poolifsc = new Pool({
      host: process.env.PGHOST,
      database: process.env.PGDATABASEIFSC,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      keepAlive: true,
    });

    testConnection(poolifsc, "IFSC DB");
  }
  return poolifsc;
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
  connectIFSCDB,
  connectMainDB,
};
