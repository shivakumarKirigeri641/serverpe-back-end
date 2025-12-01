const { connectPinCodeDB } = require("../../database/connectDB");

// 1. By pincode
exports.findByPincode = async (pincode) => {
  const db = await connectPinCodeDB();
  const result = await db.query("SELECT * FROM pincodes WHERE pincode = $1", [
    pincode,
  ]);
  return result.rows[0] || null;
};

// 2. By state
exports.findByState = async (state) => {
  const db = await connectPinCodeDB();
  const result = await db.query("SELECT * FROM pincodes WHERE state ILIKE $1", [
    state,
  ]);
  return result.rows;
};

// 3. By district
exports.findByDistrict = async (district) => {
  const db = await connectPinCodeDB();
  const result = await db.query(
    "SELECT * FROM pincodes WHERE district ILIKE $1",
    [district]
  );
  return result.rows;
};

// 4. Advanced search
exports.searchPincodes = async (params) => {
  const db = await connectPinCodeDB();

  let query = "SELECT * FROM pincodes WHERE 1=1";
  const values = [];
  let index = 1;

  for (const key of [
    "state",
    "district",
    "name",
    "pincode",
    "circle",
    "region",
  ]) {
    if (params[key]) {
      query += ` AND ${key} ILIKE $${index}`;
      values.push(`%${params[key]}%`);
      index++;
    }
  }

  const result = await db.query(query, values);
  return result.rows;
};

// 5. Unique states
exports.getAllStates = async () => {
  const db = await connectPinCodeDB();
  const result = await db.query(
    "SELECT DISTINCT state FROM pincodes ORDER BY state ASC"
  );
  return result.rows.map((r) => r.state);
};

// 6. Districts for a state
exports.getDistrictsByState = async (state) => {
  const db = await connectPinCodeDB();
  const result = await db.query(
    "SELECT DISTINCT district FROM pincodes WHERE state ILIKE $1 ORDER BY district ASC",
    [state]
  );
  return result.rows.map((r) => r.district);
};

// 7. Autocomplete
exports.getAutocomplete = async (search) => {
  const db = await connectPinCodeDB();
  const result = await db.query(
    `SELECT * FROM pincodes 
     WHERE name ILIKE $1 OR pincode LIKE $1 OR district ILIKE $1 
     LIMIT 20`,
    [`%${search}%`]
  );
  return result.rows;
};

// 8. Random
exports.getRandomPincode = async () => {
  const db = await connectPinCodeDB();
  const result = await db.query(
    "SELECT * FROM pincodes ORDER BY RANDOM() LIMIT 1"
  );
  return result.rows[0];
};

// 9. Count
exports.getTotalCount = async () => {
  const db = await connectPinCodeDB();
  const result = await db.query("SELECT COUNT(*) FROM pincodes");
  return parseInt(result.rows[0].count, 10);
};
