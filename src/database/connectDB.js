const { Pool, types } = require("pg");
require("dotenv").config();

// 🧩 Keep DATE as string (no timezone shifting)
types.setTypeParser(1082, (val) => val);

let pool = null;

const connectDB = async () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
      // ssl: { rejectUnauthorized: false }, // for AWS RDS
      // --- ALWAYS CONNECTED SETTINGS ---
      max: 20, // Max clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30s
      connectionTimeoutMillis: 2000, // Return an error after 2s if connection could not be established
      keepAlive: true, // Prevent network timeouts
    });

    // Optional: check connection once
    try {
      await pool.query("SELECT NOW()");
      console.log("✅ PostgreSQL connected");
    } catch (err) {
      console.error("❌ Connection failed", err);
      pool = null; // Reset pool so we can try again
      throw err;
    }
  }

  return pool;
};

module.exports = { connectDB };
