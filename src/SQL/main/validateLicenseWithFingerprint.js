const crypto = require("crypto");

/**
 * Validates a license and binds/verifies device fingerprint
 * 
 * Flow:
 * 1. Check if license exists and is active
 * 2. If fingerprint not yet bound → bind it (first use)
 * 3. If fingerprint already bound → verify it matches
 * 4. Return validation result
 * 
 * @param {Object} pool - Database connection pool
 * @param {string} licenseKey - License key to validate
 * @param {string} deviceFingerprint - Device fingerprint from request
 * @param {string} mobileNumber - User's mobile number (optional, for additional validation)
 * @returns {Promise<Object>} Validation result
 */
const validateLicenseWithFingerprint = async (
  pool,
  licenseKey,
  deviceFingerprint,
  mobileNumber = null
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* ------------------------------------
       1️⃣ FETCH LICENSE INFO
    ------------------------------------ */
    let query = `
      SELECT
        l.id,
        l.license_key,
        l.fk_user_id,
        l.fk_project_id,
        l.status,
        l.device_fingerprint,
        l.fingerprint_bound_at,
        u.mobile_number,
        u.user_name,
        u.email,
        p.title AS project_title,
        p.project_code
      FROM licenses l
      JOIN users u ON u.id = l.fk_user_id
      JOIN projects p ON p.id = l.fk_project_id
      WHERE l.license_key = $1
    `;

    const params = [licenseKey];

    // Optional: Add mobile number validation
    if (mobileNumber) {
      query += ` AND u.mobile_number = $2`;
      params.push(mobileNumber);
    }

    const licenseResult = await client.query(query, params);

    if (licenseResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return {
        statuscode: 403,
        successstatus: false,
        status: "Failed",
        message: "Invalid License"
      };
    }

    const license = licenseResult.rows[0];

    /* ------------------------------------
       2️⃣ CHECK IF LICENSE IS ACTIVE
    ------------------------------------ */
    if (license.status !== 'ACTIVE') {
      await client.query("ROLLBACK");
      return {
        statuscode: 403,
        successstatus: false,
        status: "Failed",
        message: "Invalid License"
      };
    }

    /* ------------------------------------
       3️⃣ HASH THE FINGERPRINT
       (Store hashed version for security)
    ------------------------------------ */
    const hashedFingerprint = crypto
      .createHash("sha256")
      .update(deviceFingerprint)
      .digest("hex");

    /* ------------------------------------
       4️⃣ FINGERPRINT BINDING LOGIC
    ------------------------------------ */
    if (!license.device_fingerprint) {
      // First use - bind the fingerprint
      await client.query(
        `UPDATE licenses
         SET device_fingerprint = $1,
             fingerprint_bound_at = NOW()
         WHERE id = $2`,
        [hashedFingerprint, license.id]
      );

      await client.query("COMMIT");

      return {
        statuscode: 200,
        successstatus: true,
        status: "Success",
        message: "License validated and fingerprint bound",
        license_info: {
          license_key: license.license_key,
          user_id: license.fk_user_id,
          project_id: license.fk_project_id,
          project_title: license.project_title,
          project_code: license.project_code,
          user_name: license.user_name,
          email: license.email,
          fingerprint_bound: true,
          first_use: true
        }
      };
    } else {
      // Already bound - verify fingerprint matches
      if (license.device_fingerprint !== hashedFingerprint) {
        await client.query("ROLLBACK");
        return {
          statuscode: 403,
          successstatus: false,
          status: "Failed",
          message: "Invalid License"
        };
      }

      await client.query("COMMIT");

      return {
        statuscode: 200,
        successstatus: true,
        status: "Success",
        message: "License validated successfully",
        license_info: {
          license_key: license.license_key,
          user_id: license.fk_user_id,
          project_id: license.fk_project_id,
          project_title: license.project_title,
          project_code: license.project_code,
          user_name: license.user_name,
          email: license.email,
          fingerprint_bound: true,
          first_use: false
        }
      };
    }
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = validateLicenseWithFingerprint;
