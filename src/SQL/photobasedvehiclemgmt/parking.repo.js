const {
  connectPhotoBasedVehicleParkingDb,
} = require("../../database/connectDB");

/* ============================================================
   🔧 ERROR MAPPER UTILITY
   ============================================================ */
const mapPgError = (err) => {
  const error = new Error(err.message || "Database operation failed");
  error.code = err.code || "DB_ERROR";
  error.statusCode = 500;

  // Handle specific PostgreSQL errors
  if (err.code === "23505") {
    error.message = "Duplicate entry: Record already exists";
    error.statusCode = 400;
  } else if (err.code === "23503") {
    error.message = "Foreign key constraint violation";
    error.statusCode = 400;
  } else if (err.code === "23502") {
    error.message = "Required field is missing";
    error.statusCode = 400;
  } else if (err.code === "22P02") {
    error.message = "Invalid input syntax";
    error.statusCode = 400;
  }

  return error;
};

/* ============================================================
   🏢 PARKING FIELDS MANAGEMENT
   ============================================================ */

/**
 * Get all parking fields with optional filters
 * @param {Object} filters - { city, district, state_union }
 */
exports.getAllParkingFields = async (filters = {}) => {
  let query = `
    SELECT 
      pkparkingfield,
      field_name,
      place_name,
      city,
      district,
      state_union,
      created_at,
      updated_at
    FROM parkingfields
    WHERE 1=1
  `;
  const values = [];
  let paramIndex = 1;

  if (filters.city) {
    query += ` AND LOWER(city) LIKE LOWER($${paramIndex})`;
    values.push(`%${filters.city}%`);
    paramIndex++;
  }
  if (filters.district) {
    query += ` AND LOWER(district) LIKE LOWER($${paramIndex})`;
    values.push(`%${filters.district}%`);
    paramIndex++;
  }
  if (filters.state_union) {
    query += ` AND LOWER(state_union) LIKE LOWER($${paramIndex})`;
    values.push(`%${filters.state_union}%`);
    paramIndex++;
  }

  query += ` ORDER BY field_name`;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values,
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR [getAllParkingFields]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get parking field by ID
 * @param {number} pkparkingfield - Primary key
 */
exports.getParkingFieldById = async (pkparkingfield) => {
  const query = `
    SELECT * FROM parkingfields WHERE pkparkingfield = $1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkparkingfield],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getParkingFieldById]:", err);
    throw mapPgError(err);
  }
};

/**
 * Create a new parking field
 * @param {Object} data - { field_name, place_name, city, district, state_union }
 */
exports.createParkingField = async (data) => {
  const query = `
    INSERT INTO parkingfields (field_name, place_name, city, district, state_union)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [
        data.field_name,
        data.place_name,
        data.city,
        data.district,
        data.state_union,
      ],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR [createParkingField]:", err);
    throw mapPgError(err);
  }
};

/**
 * Update a parking field
 * @param {number} pkparkingfield - Primary key
 * @param {Object} data - Fields to update
 */
exports.updateParkingField = async (pkparkingfield, data) => {
  const query = `
    UPDATE parkingfields
    SET 
      field_name = COALESCE($2, field_name),
      place_name = COALESCE($3, place_name),
      city = COALESCE($4, city),
      district = COALESCE($5, district),
      state_union = COALESCE($6, state_union),
      updated_at = CURRENT_TIMESTAMP
    WHERE pkparkingfield = $1
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [
        pkparkingfield,
        data.field_name,
        data.place_name,
        data.city,
        data.district,
        data.state_union,
      ],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [updateParkingField]:", err);
    throw mapPgError(err);
  }
};

/**
 * Delete a parking field
 * @param {number} pkparkingfield - Primary key
 */
exports.deleteParkingField = async (pkparkingfield) => {
  const query = `DELETE FROM parkingfields WHERE pkparkingfield = $1 RETURNING *`;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkparkingfield],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [deleteParkingField]:", err);
    throw mapPgError(err);
  }
};

/* ============================================================
   👷 STAFF MANAGEMENT
   ============================================================ */

/**
 * Get all staff for a parking field
 * @param {number} fkparkingfield - Parking field FK
 */
exports.getStaffByParkingField = async (fkparkingfield) => {
  const query = `
    SELECT 
      s.pkstaff,
      s.fkparkingfield,
      s.ipaddress,
      s.login_code,
      s.is_checkin,
      s.created_at,
      s.updated_at,
      pf.field_name
    FROM staffs s
    JOIN parkingfields pf ON s.fkparkingfield = pf.pkparkingfield
    WHERE s.fkparkingfield = $1
    ORDER BY s.created_at DESC
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [fkparkingfield],
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR [getStaffByParkingField]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get staff by ID
 * @param {number} pkstaff - Primary key
 */
exports.getStaffById = async (pkstaff) => {
  const query = `
    SELECT 
      s.*,
      pf.field_name
    FROM staffs s
    JOIN parkingfields pf ON s.fkparkingfield = pf.pkparkingfield
    WHERE s.pkstaff = $1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkstaff],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getStaffById]:", err);
    throw mapPgError(err);
  }
};

/**
 * Create a new staff member
 * @param {Object} data - { fkparkingfield, ipaddress, login_code, is_checkin }
 */
exports.createStaff = async (data) => {
  const query = `
    INSERT INTO staffs (fkparkingfield, ipaddress, login_code, is_checkin)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [
        data.fkparkingfield,
        data.ipaddress,
        data.login_code,
        data.is_checkin ?? true,
      ],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR [createStaff]:", err);
    throw mapPgError(err);
  }
};

/**
 * Update staff member
 * @param {number} pkstaff - Primary key
 * @param {Object} data - Fields to update
 */
exports.updateStaff = async (pkstaff, data) => {
  const query = `
    UPDATE staffs
    SET 
      ipaddress = COALESCE($2, ipaddress),
      login_code = COALESCE($3, login_code),
      is_checkin = COALESCE($4, is_checkin),
      updated_at = CURRENT_TIMESTAMP
    WHERE pkstaff = $1
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkstaff, data.ipaddress, data.login_code, data.is_checkin],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [updateStaff]:", err);
    throw mapPgError(err);
  }
};

/**
 * Delete staff member
 * @param {number} pkstaff - Primary key
 */
exports.deleteStaff = async (pkstaff) => {
  const query = `DELETE FROM staffs WHERE pkstaff = $1 RETURNING *`;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkstaff],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [deleteStaff]:", err);
    throw mapPgError(err);
  }
};

/**
 * Authenticate staff by login code and IP address
 * @param {string} login_code - Staff login code
 * @param {string} ipaddress - Client IP address
 */
exports.authenticateStaff = async (login_code, ipaddress) => {
  const query = `
    SELECT 
      s.*,
      pf.field_name,
      pf.place_name,
      pf.city
    FROM staffs s
    JOIN parkingfields pf ON s.fkparkingfield = pf.pkparkingfield
    WHERE s.login_code = $1 AND s.ipaddress = $2
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [login_code, ipaddress],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [authenticateStaff]:", err);
    throw mapPgError(err);
  }
};

/* ============================================================
   📋 STAFF LOGS MANAGEMENT
   ============================================================ */

/**
 * Create staff login log
 * @param {number} fkstaff - Staff FK
 */
exports.createStaffLoginLog = async (fkstaff) => {
  const query = `
    INSERT INTO staff_logs (fkstaff, login_date_time)
    VALUES ($1, CURRENT_TIMESTAMP)
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [fkstaff],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR [createStaffLoginLog]:", err);
    throw mapPgError(err);
  }
};

/**
 * Update staff logout log
 * @param {number} pkstaff_log - Log PK
 */
exports.updateStaffLogoutLog = async (pkstaff_log) => {
  const query = `
    UPDATE staff_logs
    SET logout_date_time = CURRENT_TIMESTAMP
    WHERE pkstaff_log = $1
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkstaff_log],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [updateStaffLogoutLog]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get staff logs by staff ID
 * @param {number} fkstaff - Staff FK
 * @param {number} limit - Number of records
 */
exports.getStaffLogs = async (fkstaff, limit = 50) => {
  const query = `
    SELECT 
      sl.*,
      s.login_code
    FROM staff_logs sl
    JOIN staffs s ON sl.fkstaff = s.pkstaff
    WHERE sl.fkstaff = $1
    ORDER BY sl.login_date_time DESC
    LIMIT $2
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [fkstaff, limit],
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR [getStaffLogs]:", err);
    throw mapPgError(err);
  }
};

/* ============================================================
   💰 PARKING FEES MANAGEMENT
   ============================================================ */

/**
 * Get parking fees by parking field
 * @param {number} fkparkingfield - Parking field FK
 */
exports.getParkingFeesByField = async (fkparkingfield) => {
  const query = `
    SELECT 
      pf.*,
      p.field_name
    FROM parking_fees pf
    JOIN parkingfields p ON pf.fkparkingfield = p.pkparkingfield
    WHERE pf.fkparkingfield = $1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [fkparkingfield],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getParkingFeesByField]:", err);
    throw mapPgError(err);
  }
};

/**
 * Create or update parking fees for a parking field
 * @param {number} fkparkingfield - Parking field FK
 * @param {Object} fees - Fee structure
 */
exports.upsertParkingFees = async (fkparkingfield, fees) => {
  const query = `
    INSERT INTO parking_fees (
      fkparkingfield,
      two_wheeler_minimum,
      three_wheeler_minimum,
      four_wheeler_minimum,
      others_minimum,
      two_wheeler_per_hour,
      three_wheeler_per_hour,
      four_wheeler_per_hour,
      others_wheeler_per_hour
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (fkparkingfield)
    DO UPDATE SET
      two_wheeler_minimum = EXCLUDED.two_wheeler_minimum,
      three_wheeler_minimum = EXCLUDED.three_wheeler_minimum,
      four_wheeler_minimum = EXCLUDED.four_wheeler_minimum,
      others_minimum = EXCLUDED.others_minimum,
      two_wheeler_per_hour = EXCLUDED.two_wheeler_per_hour,
      three_wheeler_per_hour = EXCLUDED.three_wheeler_per_hour,
      four_wheeler_per_hour = EXCLUDED.four_wheeler_per_hour,
      others_wheeler_per_hour = EXCLUDED.others_wheeler_per_hour,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [
        fkparkingfield,
        fees.two_wheeler_minimum ?? 10.0,
        fees.three_wheeler_minimum ?? 15.0,
        fees.four_wheeler_minimum ?? 20.0,
        fees.others_minimum ?? 25.0,
        fees.two_wheeler_per_hour ?? 10.0,
        fees.three_wheeler_per_hour ?? 15.0,
        fees.four_wheeler_per_hour ?? 20.0,
        fees.others_wheeler_per_hour ?? 25.0,
      ],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR [upsertParkingFees]:", err);
    throw mapPgError(err);
  }
};

/* ============================================================
   🚗 VEHICLE ENTRY/EXIT MANAGEMENT
   ============================================================ */

/**
 * Generate a random 4-digit OTP
 */
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Register vehicle entry
 * @param {Object} data - { fkmock_vahan, fkparkingfield, fkstaff }
 */
exports.registerVehicleEntry = async (data) => {
  const otp = generateOTP();

  const query = `
    INSERT INTO vehicle_entry_exits (
      fkmock_vahan, 
      fkparkingfield, 
      fkstaff, 
      exit_otp,
      entry_date_time
    )
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [data.fkmock_vahan, data.fkparkingfield, data.fkstaff, otp],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR [registerVehicleEntry]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get active vehicle entries (not exited) by parking field
 * @param {number} fkparkingfield - Parking field FK
 */
exports.getActiveVehicleEntries = async (fkparkingfield) => {
  const query = `
    SELECT 
      vee.*,
      mv.vehicle_number,
      mv.mobile_number,
      pf.field_name,
      s.login_code as staff_code,
      EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - vee.entry_date_time)) / 3600 as parked_hours
    FROM vehicle_entry_exits vee
    JOIN mock_vahan mv ON vee.fkmock_vahan = mv.pkmock_vahan
    JOIN parkingfields pf ON vee.fkparkingfield = pf.pkparkingfield
    JOIN staffs s ON vee.fkstaff = s.pkstaff
    WHERE vee.fkparkingfield = $1 
      AND vee.exit_date_time IS NULL
      AND vee.pay_status = FALSE
    ORDER BY vee.entry_date_time DESC
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [fkparkingfield],
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR [getActiveVehicleEntries]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get vehicle entry by OTP
 * @param {string} exit_otp - Exit OTP
 */
exports.getVehicleEntryByOTP = async (exit_otp) => {
  const query = `
    SELECT 
      vee.*,
      mv.vehicle_number,
      mv.mobile_number,
      pf.field_name,
      pf.pkparkingfield,
      EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - vee.entry_date_time)) / 60 as parked_minutes
    FROM vehicle_entry_exits vee
    JOIN mock_vahan mv ON vee.fkmock_vahan = mv.pkmock_vahan
    JOIN parkingfields pf ON vee.fkparkingfield = pf.pkparkingfield
    WHERE vee.exit_otp = $1 
      AND vee.exit_date_time IS NULL
      AND vee.pay_status = FALSE
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [exit_otp],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getVehicleEntryByOTP]:", err);
    throw mapPgError(err);
  }
};

/**
 * Calculate parking fee for a vehicle
 * @param {number} pkvehicle_entry_exit - Entry record PK
 * @param {string} vehicle_type - 'two_wheeler', 'three_wheeler', 'four_wheeler', 'others'
 */
exports.calculateParkingFee = async (pkvehicle_entry_exit, vehicle_type = "four_wheeler") => {
  const query = `
    WITH entry_info AS (
      SELECT 
        vee.*,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - vee.entry_date_time)) / 60 as total_minutes
      FROM vehicle_entry_exits vee
      WHERE vee.pkvehicle_entry_exit = $1
    ),
    fee_info AS (
      SELECT pf.*
      FROM parking_fees pf
      JOIN entry_info ei ON pf.fkparkingfield = ei.fkparkingfield
    )
    SELECT 
      ei.pkvehicle_entry_exit,
      ei.entry_date_time,
      ei.total_minutes,
      CEIL(ei.total_minutes / 60.0) as total_hours,
      fi.*,
      CASE 
        WHEN $2 = 'two_wheeler' THEN GREATEST(fi.two_wheeler_minimum, CEIL(ei.total_minutes / 60.0) * fi.two_wheeler_per_hour)
        WHEN $2 = 'three_wheeler' THEN GREATEST(fi.three_wheeler_minimum, CEIL(ei.total_minutes / 60.0) * fi.three_wheeler_per_hour)
        WHEN $2 = 'four_wheeler' THEN GREATEST(fi.four_wheeler_minimum, CEIL(ei.total_minutes / 60.0) * fi.four_wheeler_per_hour)
        ELSE GREATEST(fi.others_minimum, CEIL(ei.total_minutes / 60.0) * fi.others_wheeler_per_hour)
      END as calculated_fee
    FROM entry_info ei, fee_info fi
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkvehicle_entry_exit, vehicle_type],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [calculateParkingFee]:", err);
    throw mapPgError(err);
  }
};

/**
 * Process vehicle exit with payment
 * @param {number} pkvehicle_entry_exit - Entry record PK
 * @param {Object} paymentData - { pay_type, payment }
 */
exports.processVehicleExit = async (pkvehicle_entry_exit, paymentData) => {
  const query = `
    UPDATE vehicle_entry_exits
    SET 
      exit_date_time = CURRENT_TIMESTAMP,
      pay_status = TRUE,
      pay_type = $2,
      payment = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE pkvehicle_entry_exit = $1
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [
        pkvehicle_entry_exit,
        paymentData.pay_type || "UPI",
        paymentData.payment,
      ],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [processVehicleExit]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get vehicle entry/exit history
 * @param {Object} filters - { fkparkingfield, fkmock_vahan, from_date, to_date }
 * @param {number} limit - Number of records
 */
exports.getVehicleHistory = async (filters = {}, limit = 100) => {
  let query = `
    SELECT 
      vee.*,
      mv.vehicle_number,
      mv.mobile_number,
      pf.field_name,
      s.login_code as staff_code
    FROM vehicle_entry_exits vee
    JOIN mock_vahan mv ON vee.fkmock_vahan = mv.pkmock_vahan
    JOIN parkingfields pf ON vee.fkparkingfield = pf.pkparkingfield
    JOIN staffs s ON vee.fkstaff = s.pkstaff
    WHERE 1=1
  `;
  const values = [];
  let paramIndex = 1;

  if (filters.fkparkingfield) {
    query += ` AND vee.fkparkingfield = $${paramIndex}`;
    values.push(filters.fkparkingfield);
    paramIndex++;
  }
  if (filters.fkmock_vahan) {
    query += ` AND vee.fkmock_vahan = $${paramIndex}`;
    values.push(filters.fkmock_vahan);
    paramIndex++;
  }
  if (filters.from_date) {
    query += ` AND vee.entry_date_time >= $${paramIndex}`;
    values.push(filters.from_date);
    paramIndex++;
  }
  if (filters.to_date) {
    query += ` AND vee.entry_date_time <= $${paramIndex}`;
    values.push(filters.to_date);
    paramIndex++;
  }

  query += ` ORDER BY vee.entry_date_time DESC LIMIT $${paramIndex}`;
  values.push(limit);

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values,
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR [getVehicleHistory]:", err);
    throw mapPgError(err);
  }
};

/**
 * Mark vehicle as blacklisted
 * @param {number} pkvehicle_entry_exit - Entry record PK
 * @param {string} reason - Blacklist reason
 * @param {number} penalty - Penalty amount
 */
exports.blacklistVehicleEntry = async (pkvehicle_entry_exit, reason, penalty = 0) => {
  const query = `
    UPDATE vehicle_entry_exits
    SET 
      is_blacklisted = TRUE,
      blacklist_reason = $2,
      penalty = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE pkvehicle_entry_exit = $1
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkvehicle_entry_exit, reason, penalty],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [blacklistVehicleEntry]:", err);
    throw mapPgError(err);
  }
};

/**
 * Mark OTP as shared
 * @param {number} pkvehicle_entry_exit - Entry record PK
 */
exports.markOTPShared = async (pkvehicle_entry_exit) => {
  const query = `
    UPDATE vehicle_entry_exits
    SET is_otp_shared = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE pkvehicle_entry_exit = $1
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkvehicle_entry_exit],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [markOTPShared]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get parking statistics for a field
 * @param {number} fkparkingfield - Parking field FK
 * @param {string} date - Date for stats (YYYY-MM-DD)
 */
exports.getParkingStatistics = async (fkparkingfield, date = null) => {
  const targetDate = date || new Date().toISOString().split("T")[0];

  const query = `
    SELECT 
      COUNT(*) FILTER (WHERE DATE(entry_date_time) = $2) as total_entries_today,
      COUNT(*) FILTER (WHERE DATE(entry_date_time) = $2 AND pay_status = TRUE) as completed_exits_today,
      COUNT(*) FILTER (WHERE exit_date_time IS NULL AND pay_status = FALSE) as currently_parked,
      COALESCE(SUM(payment) FILTER (WHERE DATE(exit_date_time) = $2), 0) as revenue_today,
      COALESCE(SUM(penalty) FILTER (WHERE DATE(exit_date_time) = $2), 0) as penalties_today,
      COUNT(*) FILTER (WHERE is_blacklisted = TRUE AND DATE(entry_date_time) = $2) as blacklisted_today
    FROM vehicle_entry_exits
    WHERE fkparkingfield = $1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [fkparkingfield, targetDate],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getParkingStatistics]:", err);
    throw mapPgError(err);
  }
};
