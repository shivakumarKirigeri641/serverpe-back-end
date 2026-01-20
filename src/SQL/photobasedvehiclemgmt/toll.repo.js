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
   🚗 MOCK VAHAN (Vehicle Registry) MANAGEMENT
   ============================================================ */

/**
 * Get all vehicles with optional search
 * @param {string} searchQuery - Search by vehicle number or mobile
 * @param {number} limit - Number of records
 */
exports.getAllVehicles = async (searchQuery = null, limit = 50) => {
  let query = `
    SELECT 
      pkmock_vahan,
      vehicle_number,
      tag_balance,
      mobile_number,
      created_at,
      updated_at
    FROM mock_vahan
  `;
  const values = [];

  if (searchQuery) {
    query += ` WHERE UPPER(vehicle_number) LIKE UPPER($1) OR mobile_number LIKE $1`;
    values.push(`%${searchQuery}%`);
    query += ` ORDER BY vehicle_number LIMIT $2`;
    values.push(limit);
  } else {
    query += ` ORDER BY created_at DESC LIMIT $1`;
    values.push(limit);
  }

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values,
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR [getAllVehicles]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get vehicle by ID
 * @param {number} pkmock_vahan - Primary key
 */
exports.getVehicleById = async (pkmock_vahan) => {
  const query = `SELECT * FROM mock_vahan WHERE pkmock_vahan = $1`;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkmock_vahan],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getVehicleById]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get vehicle by vehicle number
 * @param {string} vehicle_number - Vehicle registration number
 */
exports.getVehicleByNumber = async (vehicle_number) => {
  const query = `SELECT * FROM mock_vahan WHERE UPPER(vehicle_number) = UPPER($1)`;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [vehicle_number],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getVehicleByNumber]:", err);
    throw mapPgError(err);
  }
};

/**
 * Register a new vehicle
 * @param {Object} data - { vehicle_number, mobile_number, tag_balance }
 */
exports.registerVehicle = async (data) => {
  const query = `
    INSERT INTO mock_vahan (vehicle_number, mobile_number, tag_balance)
    VALUES (UPPER($1), $2, $3)
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [
        data.vehicle_number,
        data.mobile_number,
        data.tag_balance ?? 0.0,
      ],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR [registerVehicle]:", err);
    throw mapPgError(err);
  }
};

/**
 * Update vehicle details
 * @param {number} pkmock_vahan - Primary key
 * @param {Object} data - Fields to update
 */
exports.updateVehicle = async (pkmock_vahan, data) => {
  const query = `
    UPDATE mock_vahan
    SET 
      mobile_number = COALESCE($2, mobile_number),
      updated_at = CURRENT_TIMESTAMP
    WHERE pkmock_vahan = $1
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkmock_vahan, data.mobile_number],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [updateVehicle]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get vehicle tag balance
 * @param {number} pkmock_vahan - Primary key
 */
exports.getVehicleBalance = async (pkmock_vahan) => {
  const query = `
    SELECT pkmock_vahan, vehicle_number, tag_balance 
    FROM mock_vahan 
    WHERE pkmock_vahan = $1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pkmock_vahan],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getVehicleBalance]:", err);
    throw mapPgError(err);
  }
};

/* ============================================================
   🏛️ TOLL PLAZA MANAGEMENT
   ============================================================ */

/**
 * Get all toll plazas with optional filters
 * @param {Object} filters - { district, state_union }
 */
exports.getAllTollPlazas = async (filters = {}) => {
  let query = `
    SELECT 
      pktoll_plaza,
      plaza_id,
      plaza_name,
      place_name,
      district,
      state_union,
      created_at,
      updated_at
    FROM toll_plaza
    WHERE 1=1
  `;
  const values = [];
  let paramIndex = 1;

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

  query += ` ORDER BY plaza_name`;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values,
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR [getAllTollPlazas]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get toll plaza by ID
 * @param {number} pktoll_plaza - Primary key
 */
exports.getTollPlazaById = async (pktoll_plaza) => {
  const query = `SELECT * FROM toll_plaza WHERE pktoll_plaza = $1`;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pktoll_plaza],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getTollPlazaById]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get toll plaza by plaza ID (unique identifier)
 * @param {string} plaza_id - Unique plaza identifier
 */
exports.getTollPlazaByPlazaId = async (plaza_id) => {
  const query = `SELECT * FROM toll_plaza WHERE plaza_id = $1`;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [plaza_id],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getTollPlazaByPlazaId]:", err);
    throw mapPgError(err);
  }
};

/**
 * Create a new toll plaza
 * @param {Object} data - { plaza_id, plaza_name, place_name, district, state_union }
 */
exports.createTollPlaza = async (data) => {
  const query = `
    INSERT INTO toll_plaza (plaza_id, plaza_name, place_name, district, state_union)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [
        data.plaza_id,
        data.plaza_name,
        data.place_name,
        data.district,
        data.state_union,
      ],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR [createTollPlaza]:", err);
    throw mapPgError(err);
  }
};

/**
 * Update toll plaza
 * @param {number} pktoll_plaza - Primary key
 * @param {Object} data - Fields to update
 */
exports.updateTollPlaza = async (pktoll_plaza, data) => {
  const query = `
    UPDATE toll_plaza
    SET 
      plaza_name = COALESCE($2, plaza_name),
      place_name = COALESCE($3, place_name),
      district = COALESCE($4, district),
      state_union = COALESCE($5, state_union),
      updated_at = CURRENT_TIMESTAMP
    WHERE pktoll_plaza = $1
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [
        pktoll_plaza,
        data.plaza_name,
        data.place_name,
        data.district,
        data.state_union,
      ],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [updateTollPlaza]:", err);
    throw mapPgError(err);
  }
};

/**
 * Delete toll plaza
 * @param {number} pktoll_plaza - Primary key
 */
exports.deleteTollPlaza = async (pktoll_plaza) => {
  const query = `DELETE FROM toll_plaza WHERE pktoll_plaza = $1 RETURNING *`;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pktoll_plaza],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [deleteTollPlaza]:", err);
    throw mapPgError(err);
  }
};

/* ============================================================
   🛤️ TOLL PLAZA LANE MANAGEMENT
   ============================================================ */

/**
 * Get all lanes for a toll plaza
 * @param {number} fktoll_plaza - Toll plaza FK
 */
exports.getLanesByTollPlaza = async (fktoll_plaza) => {
  const query = `
    SELECT 
      tpl.*,
      tp.plaza_name,
      tp.plaza_id
    FROM toll_plaza_lane tpl
    JOIN toll_plaza tp ON tpl.fktoll_plaza = tp.pktoll_plaza
    WHERE tpl.fktoll_plaza = $1
    ORDER BY tpl.laneid
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [fktoll_plaza],
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR [getLanesByTollPlaza]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get lane by ID
 * @param {number} pktoll_plaza_lane - Primary key
 */
exports.getLaneById = async (pktoll_plaza_lane) => {
  const query = `
    SELECT 
      tpl.*,
      tp.plaza_name,
      tp.plaza_id
    FROM toll_plaza_lane tpl
    JOIN toll_plaza tp ON tpl.fktoll_plaza = tp.pktoll_plaza
    WHERE tpl.pktoll_plaza_lane = $1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pktoll_plaza_lane],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getLaneById]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get lane by IP address
 * @param {string} ip_address - Lane IP address
 */
exports.getLaneByIP = async (ip_address) => {
  const query = `
    SELECT 
      tpl.*,
      tp.plaza_name,
      tp.plaza_id,
      tp.pktoll_plaza
    FROM toll_plaza_lane tpl
    JOIN toll_plaza tp ON tpl.fktoll_plaza = tp.pktoll_plaza
    WHERE tpl.ip_address = $1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [ip_address],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getLaneByIP]:", err);
    throw mapPgError(err);
  }
};

/**
 * Create a new toll plaza lane
 * @param {Object} data - { fktoll_plaza, laneid, ip_address }
 */
exports.createLane = async (data) => {
  const query = `
    INSERT INTO toll_plaza_lane (fktoll_plaza, laneid, ip_address)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [data.fktoll_plaza, data.laneid, data.ip_address],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR [createLane]:", err);
    throw mapPgError(err);
  }
};

/**
 * Update toll plaza lane
 * @param {number} pktoll_plaza_lane - Primary key
 * @param {Object} data - Fields to update
 */
exports.updateLane = async (pktoll_plaza_lane, data) => {
  const query = `
    UPDATE toll_plaza_lane
    SET 
      laneid = COALESCE($2, laneid),
      ip_address = COALESCE($3, ip_address),
      updated_at = CURRENT_TIMESTAMP
    WHERE pktoll_plaza_lane = $1
    RETURNING *
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pktoll_plaza_lane, data.laneid, data.ip_address],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [updateLane]:", err);
    throw mapPgError(err);
  }
};

/**
 * Delete toll plaza lane
 * @param {number} pktoll_plaza_lane - Primary key
 */
exports.deleteLane = async (pktoll_plaza_lane) => {
  const query = `DELETE FROM toll_plaza_lane WHERE pktoll_plaza_lane = $1 RETURNING *`;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pktoll_plaza_lane],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [deleteLane]:", err);
    throw mapPgError(err);
  }
};

/* ============================================================
   💳 TAG WALLET CREDITS MANAGEMENT
   ============================================================ */

/**
 * Add credit to vehicle tag wallet
 * @param {Object} data - { fkmock_vahan, credit_amount, pay_type }
 */
exports.addWalletCredit = async (data) => {
  const pool = connectPhotoBasedVehicleParkingDb();

  try {
    await pool.query("BEGIN");

    // Insert credit record
    const creditQuery = `
      INSERT INTO tag_wallet_credits (fkmock_vahan, credit_amount, pay_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const creditResult = await pool.query({
      text: creditQuery,
      values: [data.fkmock_vahan, data.credit_amount, data.pay_type || "UPI"],
      statement_timeout: 5000,
    });

    // Update vehicle tag balance
    const updateBalanceQuery = `
      UPDATE mock_vahan
      SET 
        tag_balance = tag_balance + $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE pkmock_vahan = $1
      RETURNING *
    `;
    const balanceResult = await pool.query({
      text: updateBalanceQuery,
      values: [data.fkmock_vahan, data.credit_amount],
      statement_timeout: 5000,
    });

    await pool.query("COMMIT");

    return {
      credit: creditResult.rows[0],
      updated_vehicle: balanceResult.rows[0],
    };
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("PG ERROR [addWalletCredit]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get credit history for a vehicle
 * @param {number} fkmock_vahan - Vehicle FK
 * @param {number} limit - Number of records
 */
exports.getWalletCreditHistory = async (fkmock_vahan, limit = 50) => {
  const query = `
    SELECT 
      twc.*,
      mv.vehicle_number
    FROM tag_wallet_credits twc
    JOIN mock_vahan mv ON twc.fkmock_vahan = mv.pkmock_vahan
    WHERE twc.fkmock_vahan = $1
    ORDER BY twc.created_at DESC
    LIMIT $2
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [fkmock_vahan, limit],
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR [getWalletCreditHistory]:", err);
    throw mapPgError(err);
  }
};

/* ============================================================
   💸 TAG WALLET DEDUCTIONS MANAGEMENT
   ============================================================ */

/**
 * Process toll deduction from vehicle wallet
 * @param {Object} data - { fkmock_vahan, fktoll_plaza_lane, amount_deducted }
 */
exports.processTollDeduction = async (data) => {
  const pool = connectPhotoBasedVehicleParkingDb();

  try {
    await pool.query("BEGIN");

    // Check current balance
    const balanceCheck = await pool.query({
      text: `SELECT tag_balance FROM mock_vahan WHERE pkmock_vahan = $1`,
      values: [data.fkmock_vahan],
      statement_timeout: 5000,
    });

    if (!balanceCheck.rows[0]) {
      throw new Error("Vehicle not found");
    }

    const currentBalance = parseFloat(balanceCheck.rows[0].tag_balance);
    if (currentBalance < data.amount_deducted) {
      await pool.query("ROLLBACK");
      return {
        success: false,
        error: "INSUFFICIENT_BALANCE",
        message: `Insufficient balance. Available: ₹${currentBalance.toFixed(2)}, Required: ₹${data.amount_deducted}`,
        current_balance: currentBalance,
      };
    }

    // Insert deduction record
    const deductQuery = `
      INSERT INTO tag_wallet_deductions (fkmock_vahan, fktoll_plaza_lane, amount_deducted)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const deductResult = await pool.query({
      text: deductQuery,
      values: [data.fkmock_vahan, data.fktoll_plaza_lane, data.amount_deducted],
      statement_timeout: 5000,
    });

    // Update vehicle tag balance
    const updateBalanceQuery = `
      UPDATE mock_vahan
      SET 
        tag_balance = tag_balance - $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE pkmock_vahan = $1
      RETURNING *
    `;
    const balanceResult = await pool.query({
      text: updateBalanceQuery,
      values: [data.fkmock_vahan, data.amount_deducted],
      statement_timeout: 5000,
    });

    await pool.query("COMMIT");

    return {
      success: true,
      deduction: deductResult.rows[0],
      updated_vehicle: balanceResult.rows[0],
    };
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("PG ERROR [processTollDeduction]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get deduction history for a vehicle
 * @param {number} fkmock_vahan - Vehicle FK
 * @param {number} limit - Number of records
 */
exports.getWalletDeductionHistory = async (fkmock_vahan, limit = 50) => {
  const query = `
    SELECT 
      twd.*,
      mv.vehicle_number,
      tpl.laneid,
      tp.plaza_name,
      tp.plaza_id
    FROM tag_wallet_deductions twd
    JOIN mock_vahan mv ON twd.fkmock_vahan = mv.pkmock_vahan
    JOIN toll_plaza_lane tpl ON twd.fktoll_plaza_lane = tpl.pktoll_plaza_lane
    JOIN toll_plaza tp ON tpl.fktoll_plaza = tp.pktoll_plaza
    WHERE twd.fkmock_vahan = $1
    ORDER BY twd.created_at DESC
    LIMIT $2
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [fkmock_vahan, limit],
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR [getWalletDeductionHistory]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get deduction history for a toll plaza lane
 * @param {number} fktoll_plaza_lane - Lane FK
 * @param {string} date - Date for filtering (YYYY-MM-DD)
 * @param {number} limit - Number of records
 */
exports.getLaneDeductionHistory = async (fktoll_plaza_lane, date = null, limit = 100) => {
  let query = `
    SELECT 
      twd.*,
      mv.vehicle_number,
      mv.mobile_number
    FROM tag_wallet_deductions twd
    JOIN mock_vahan mv ON twd.fkmock_vahan = mv.pkmock_vahan
    WHERE twd.fktoll_plaza_lane = $1
  `;
  const values = [fktoll_plaza_lane];
  let paramIndex = 2;

  if (date) {
    query += ` AND DATE(twd.created_at) = $${paramIndex}`;
    values.push(date);
    paramIndex++;
  }

  query += ` ORDER BY twd.created_at DESC LIMIT $${paramIndex}`;
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
    console.error("PG ERROR [getLaneDeductionHistory]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get complete wallet transaction history for a vehicle
 * @param {number} fkmock_vahan - Vehicle FK
 * @param {number} limit - Number of records
 */
exports.getWalletTransactionHistory = async (fkmock_vahan, limit = 50) => {
  const query = `
    WITH credits AS (
      SELECT 
        pktag_wallet_credits as id,
        'CREDIT'::TEXT as transaction_type,
        credit_amount as amount,
        pay_type::TEXT,
        NULL::VARCHAR as plaza_name,
        NULL::VARCHAR as laneid,
        created_at
      FROM tag_wallet_credits
      WHERE fkmock_vahan = $1
    ),
    debits AS (
      SELECT 
        twd.pktag_wallet_deductions as id,
        'DEBIT'::TEXT as transaction_type,
        twd.amount_deducted as amount,
        'TOLL'::TEXT as pay_type,
        tp.plaza_name::VARCHAR,
        tpl.laneid::VARCHAR,
        twd.created_at
      FROM tag_wallet_deductions twd
      JOIN toll_plaza_lane tpl ON twd.fktoll_plaza_lane = tpl.pktoll_plaza_lane
      JOIN toll_plaza tp ON tpl.fktoll_plaza = tp.pktoll_plaza
      WHERE twd.fkmock_vahan = $1
    )
    SELECT * FROM (
      SELECT * FROM credits
      UNION ALL
      SELECT * FROM debits
    ) combined
    ORDER BY created_at DESC
    LIMIT $2
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [fkmock_vahan, limit],
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR [getWalletTransactionHistory]:", err);
    throw mapPgError(err);
  }
};

/**
 * Get toll plaza statistics
 * @param {number} pktoll_plaza - Toll plaza PK
 * @param {string} date - Date for stats (YYYY-MM-DD)
 */
exports.getTollPlazaStatistics = async (pktoll_plaza, date = null) => {
  const targetDate = date || new Date().toISOString().split("T")[0];

  const query = `
    SELECT 
      tp.pktoll_plaza,
      tp.plaza_name,
      tp.plaza_id,
      COUNT(twd.pktag_wallet_deductions) FILTER (WHERE DATE(twd.created_at) = $2) as transactions_today,
      COALESCE(SUM(twd.amount_deducted) FILTER (WHERE DATE(twd.created_at) = $2), 0) as revenue_today,
      COUNT(DISTINCT twd.fkmock_vahan) FILTER (WHERE DATE(twd.created_at) = $2) as unique_vehicles_today,
      (SELECT COUNT(*) FROM toll_plaza_lane WHERE fktoll_plaza = $1) as total_lanes
    FROM toll_plaza tp
    LEFT JOIN toll_plaza_lane tpl ON tp.pktoll_plaza = tpl.fktoll_plaza
    LEFT JOIN tag_wallet_deductions twd ON tpl.pktoll_plaza_lane = twd.fktoll_plaza_lane
    WHERE tp.pktoll_plaza = $1
    GROUP BY tp.pktoll_plaza, tp.plaza_name, tp.plaza_id
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [pktoll_plaza, targetDate],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR [getTollPlazaStatistics]:", err);
    throw mapPgError(err);
  }
};
