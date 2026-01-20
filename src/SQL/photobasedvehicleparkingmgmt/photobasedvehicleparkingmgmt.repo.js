const {
  connectPhotoBasedVehicleParkingDb,
} = require("../../database/connectDB");

// ===============================
// STAFF OPERATIONS
// ===============================

/**
 * Get all parking staff
 */
exports.getAllParkingStaff = async () => {
  const query = `
    SELECT
      id,
      staff_name,
      email,
      role,
      is_active,
      created_at
    FROM parking_staff
    ORDER BY created_at DESC
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR - getAllParkingStaff:", err);
    throw err;
  }
};

/**
 * Get staff by email
 */
exports.getStaffByEmail = async (email) => {
  const query = `
    SELECT
      id,
      staff_name,
      email,
      role,
      is_active,
      created_at
    FROM parking_staff
    WHERE email = $1 AND is_active = TRUE
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [email],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR - getStaffByEmail:", err);
    throw err;
  }
};

/**
 * Log staff login
 */
exports.logStaffLogin = async (staffId, loginOtp, ipAddress) => {
  const query = `
    INSERT INTO staff_login_logs (staff_id, login_otp, ip_address)
    VALUES ($1, $2, $3)
    RETURNING id, login_time
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [staffId, loginOtp, ipAddress],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR - logStaffLogin:", err);
    throw err;
  }
};

/**
 * Verify staff OTP
 */
exports.verifyStaffOtp = async (email, loginOtp) => {
  const query = `
    SELECT 
      s.id,
      s.staff_name,
      s.email,
      s.role,
      l.login_otp,
      l.login_time
    FROM parking_staff s
    INNER JOIN staff_login_logs l ON s.id = l.staff_id
    WHERE s.email = $1 
      AND s.is_active = TRUE
      AND l.login_otp = $2
      AND l.login_time > NOW() - INTERVAL '10 minutes'
    ORDER BY l.login_time DESC
    LIMIT 1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [email, loginOtp],
      statement_timeout: 5000,
    });

    if (result.rows.length === 0) {
      return {
        success: false,
        message: "Invalid or expired OTP",
      };
    }

    return {
      success: true,
      staff: result.rows[0],
    };
  } catch (err) {
    console.error("PG ERROR - verifyStaffOtp:", err);
    throw err;
  }
};

// ===============================
// eVAHAN VEHICLE OPERATIONS
// ===============================

/**
 * Get vehicle details from eVAHAN mock database
 */
exports.getVehicleFromEvahan = async (vehicleNumber) => {
  const query = `
    SELECT
      id,
      vehicle_number,
      owner_name,
      mobile_number,
      vehicle_type,
      created_at
    FROM evahan_vehicles
    WHERE vehicle_number = $1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [vehicleNumber.toUpperCase()],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR - getVehicleFromEvahan:", err);
    throw err;
  }
};

/**
 * Get student mobile number from license for this project
 */
exports.getStudentMobileForProject = async (projectName) => {
  const { connectServerPeDb } = require("../../database/connectDB");
  const query = `
    SELECT student_mobile
    FROM student_licenses
    WHERE project_name = $1 
      AND status = 'active'
      AND expiry_date > NOW()
    ORDER BY purchase_date DESC
    LIMIT 1
  `;

  try {
    const pool = connectServerPeDb();
    const result = await pool.query({
      text: query,
      values: [projectName],
      statement_timeout: 5000,
    });
    return result.rows[0]?.student_mobile || "9999999999"; // Default fallback
  } catch (err) {
    console.error("PG ERROR - getStudentMobileForProject:", err);
    return "9999999999"; // Fallback on error
  }
};

/**
 * Create vehicle in eVAHAN if not exists
 */
exports.createVehicleInEvahan = async (
  vehicleNumber,
  vehicleType,
  mobileNumber,
) => {
  const query = `
    INSERT INTO evahan_vehicles (vehicle_number, owner_name, mobile_number, vehicle_type)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (vehicle_number) 
    DO UPDATE SET 
      mobile_number = EXCLUDED.mobile_number,
      vehicle_type = EXCLUDED.vehicle_type
    RETURNING id, vehicle_number, owner_name, mobile_number, vehicle_type, created_at
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [
        vehicleNumber.toUpperCase(),
        "Auto Created",
        mobileNumber,
        vehicleType,
      ],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR - createVehicleInEvahan:", err);
    throw err;
  }
};

// ===============================
// VEHICLE MASTER OPERATIONS
// ===============================

/**
 * Add or get vehicle from master
 */
exports.addOrGetVehicle = async (vehicleNumber, vehicleType, mobileNumber) => {
  const query = `
    INSERT INTO vehicles (vehicle_number, vehicle_type, mobile_number)
    VALUES ($1, $2, $3)
    ON CONFLICT (vehicle_number) DO UPDATE
    SET vehicle_type = EXCLUDED.vehicle_type,
        mobile_number = EXCLUDED.mobile_number
    RETURNING id, vehicle_number, vehicle_type, mobile_number, first_seen_at
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [vehicleNumber.toUpperCase(), vehicleType, mobileNumber],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR - addOrGetVehicle:", err);
    throw err;
  }
};

/**
 * Get vehicle by number
 */
exports.getVehicleByNumber = async (vehicleNumber) => {
  const query = `
    SELECT
      id,
      vehicle_number,
      vehicle_type,
      mobile_number,
      first_seen_at
    FROM vehicles
    WHERE vehicle_number = $1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [vehicleNumber.toUpperCase()],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR - getVehicleByNumber:", err);
    throw err;
  }
};

// ===============================
// PARKING TARIFF OPERATIONS
// ===============================

/**
 * Get parking tariff by vehicle type
 */
exports.getParkingTariff = async (vehicleType) => {
  const query = `
    SELECT
      id,
      vehicle_type,
      first_hour_amount,
      additional_hour_amount,
      created_at
    FROM parking_tariff
    WHERE vehicle_type = $1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [vehicleType.toUpperCase()],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR - getParkingTariff:", err);
    throw err;
  }
};

/**
 * Get all parking tariffs
 */
exports.getAllParkingTariffs = async () => {
  const query = `
    SELECT
      id,
      vehicle_type,
      first_hour_amount,
      additional_hour_amount,
      created_at
    FROM parking_tariff
    ORDER BY vehicle_type
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR - getAllParkingTariffs:", err);
    throw err;
  }
};

// ===============================
// VEHICLE ENTRY OPERATIONS (CHECK-IN)
// ===============================

/**
 * Create vehicle entry (check-in)
 */
exports.createVehicleEntry = async (
  vehicleId,
  checkinStaffId,
  vehiclePhotoPath,
) => {
  const query = `
    INSERT INTO vehicle_entries (vehicle_id, checkin_staff_id, vehicle_photo_path)
    VALUES ($1, $2, $3)
    RETURNING 
      id,
      vehicle_id,
      checkin_staff_id,
      checkin_time,
      vehicle_photo_path,
      exit_otp,
      status
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [vehicleId, checkinStaffId, vehiclePhotoPath],
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR - createVehicleEntry:", err);
    throw err;
  }
};

/**
 * Get active vehicle entry (vehicle currently in parking)
 */
exports.getActiveVehicleEntry = async (vehicleId) => {
  const query = `
    SELECT
      ve.id,
      ve.vehicle_id,
      ve.checkin_staff_id,
      ve.checkin_time,
      ve.vehicle_photo_path,
      ve.exit_otp,
      ve.otp_verified,
      ve.status,
      v.vehicle_number,
      v.vehicle_type,
      v.mobile_number,
      cs.staff_name as checkin_staff_name
    FROM vehicle_entries ve
    JOIN vehicles v ON ve.vehicle_id = v.id
    LEFT JOIN parking_staff cs ON ve.checkin_staff_id = cs.id
    WHERE ve.vehicle_id = $1 AND ve.status = 'IN'
    ORDER BY ve.checkin_time DESC
    LIMIT 1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [vehicleId],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR - getActiveVehicleEntry:", err);
    throw err;
  }
};

/**
 * Get active vehicle entry by exit OTP
 */
exports.getActiveEntryByOtp = async (exitOtp) => {
  const query = `
    SELECT
      ve.id,
      ve.vehicle_id,
      ve.checkin_staff_id,
      ve.checkin_time,
      ve.vehicle_photo_path,
      ve.exit_otp,
      ve.otp_verified,
      ve.status,
      v.vehicle_number,
      v.vehicle_type,
      v.mobile_number,
      cs.staff_name as checkin_staff_name
    FROM vehicle_entries ve
    JOIN vehicles v ON ve.vehicle_id = v.id
    LEFT JOIN parking_staff cs ON ve.checkin_staff_id = cs.id
    WHERE ve.exit_otp = $1 AND ve.status = 'IN'
    ORDER BY ve.checkin_time DESC
    LIMIT 1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [exitOtp],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR - getActiveEntryByOtp:", err);
    throw err;
  }
};

/**
 * Get vehicle entry by ID
 */
exports.getVehicleEntryById = async (entryId) => {
  const query = `
    SELECT
      ve.id,
      ve.vehicle_id,
      ve.checkin_staff_id,
      ve.checkout_staff_id,
      ve.checkin_time,
      ve.checkout_time,
      ve.vehicle_photo_path,
      ve.exit_otp,
      ve.otp_verified,
      ve.parking_minutes,
      ve.parking_amount,
      ve.status,
      v.vehicle_number,
      v.vehicle_type,
      v.mobile_number,
      cs.staff_name as checkin_staff_name,
      cos.staff_name as checkout_staff_name
    FROM vehicle_entries ve
    JOIN vehicles v ON ve.vehicle_id = v.id
    LEFT JOIN parking_staff cs ON ve.checkin_staff_id = cs.id
    LEFT JOIN parking_staff cos ON ve.checkout_staff_id = cos.id
    WHERE ve.id = $1
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [entryId],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR - getVehicleEntryById:", err);
    throw err;
  }
};

// ===============================
// VEHICLE EXIT OPERATIONS (CHECK-OUT)
// ===============================

/**
 * Verify exit OTP and process checkout
 */
exports.processVehicleCheckout = async (entryId, exitOtp, checkoutStaffId) => {
  const query = `
    UPDATE vehicle_entries
    SET 
      checkout_time = CURRENT_TIMESTAMP,
      checkout_staff_id = $3
    WHERE id = $1 
      AND exit_otp = $2 
      AND status = 'IN'
    RETURNING 
      id,
      vehicle_id,
      checkin_time,
      checkout_time,
      parking_minutes,
      parking_amount,
      status
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [entryId, exitOtp, checkoutStaffId],
      statement_timeout: 5000,
    });
    return result.rows[0] || null;
  } catch (err) {
    console.error("PG ERROR - processVehicleCheckout:", err);
    throw err;
  }
};

/**
 * Get all vehicle entries with filters
 */
exports.getAllVehicleEntries = async (
  status = null,
  limit = 100,
  offset = 0,
) => {
  let query = `
    SELECT
      ve.id,
      ve.vehicle_id,
      ve.checkin_staff_id,
      ve.checkout_staff_id,
      ve.checkin_time,
      ve.checkout_time,
      ve.vehicle_photo_path,
      ve.exit_otp,
      ve.otp_verified,
      ve.parking_minutes,
      ve.parking_amount,
      ve.status,
      v.vehicle_number,
      v.vehicle_type,
      v.mobile_number,
      cs.staff_name as checkin_staff_name,
      cos.staff_name as checkout_staff_name
    FROM vehicle_entries ve
    JOIN vehicles v ON ve.vehicle_id = v.id
    LEFT JOIN parking_staff cs ON ve.checkin_staff_id = cs.id
    LEFT JOIN parking_staff cos ON ve.checkout_staff_id = cos.id
  `;

  const values = [];
  if (status) {
    query += ` WHERE ve.status = $1`;
    values.push(status);
  }

  query += ` ORDER BY ve.checkin_time DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: values,
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR - getAllVehicleEntries:", err);
    throw err;
  }
};

/**
 * Get parking statistics
 */
exports.getParkingStats = async () => {
  const query = `
    SELECT
      COUNT(*) FILTER (WHERE status = 'IN') as vehicles_inside,
      COUNT(*) FILTER (WHERE status = 'OUT') as total_exits,
      COUNT(*) as total_entries,
      COALESCE(SUM(parking_amount) FILTER (WHERE status = 'OUT'), 0) as total_revenue,
      COUNT(DISTINCT vehicle_id) as unique_vehicles
    FROM vehicle_entries
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      statement_timeout: 5000,
    });
    return result.rows[0];
  } catch (err) {
    console.error("PG ERROR - getParkingStats:", err);
    throw err;
  }
};

/**
 * Get vehicle parking history
 */
exports.getVehicleParkingHistory = async (vehicleNumber) => {
  const query = `
    SELECT
      ve.id,
      ve.checkin_time,
      ve.checkout_time,
      ve.parking_minutes,
      ve.parking_amount,
      ve.status,
      cs.staff_name as checkin_staff_name,
      cos.staff_name as checkout_staff_name
    FROM vehicle_entries ve
    JOIN vehicles v ON ve.vehicle_id = v.id
    LEFT JOIN parking_staff cs ON ve.checkin_staff_id = cs.id
    LEFT JOIN parking_staff cos ON ve.checkout_staff_id = cos.id
    WHERE v.vehicle_number = $1
    ORDER BY ve.checkin_time DESC
  `;

  try {
    const pool = connectPhotoBasedVehicleParkingDb();
    const result = await pool.query({
      text: query,
      values: [vehicleNumber.toUpperCase()],
      statement_timeout: 5000,
    });
    return result.rows;
  } catch (err) {
    console.error("PG ERROR - getVehicleParkingHistory:", err);
    throw err;
  }
};
