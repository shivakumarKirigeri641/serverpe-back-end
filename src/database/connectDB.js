const { Pool, types } = require("pg");
require("dotenv").config();
let pool = null;
const connectDB = async () => {
  if (!pool) {
    //types.setTypeParser(1082, (val) => val); // keeps '2025-11-01' as a plain string
    pool = new Pool({
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
      //ssl: { rejectUnauthorized: false }, // needed for AWS RDS
    });
  }
  return pool;
};
module.exports = { connectDB };
