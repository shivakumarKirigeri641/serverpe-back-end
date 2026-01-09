/**
 * Reset device fingerprint for a license
 * Allows the license to be used on a different device
 * 
 * @param {Object} pool - Database connection pool
 * @param {string} licenseKey - License key to reset
 * @param {number} adminUserId - ID of admin performing the action (for logging)
 * @returns {Promise<Object>} Reset result
 */
const resetLicenseFingerprint = async (pool, licenseKey, adminUserId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* ------------------------------------
       1️⃣ VERIFY LICENSE EXISTS
    ------------------------------------ */
    const licenseResult = await client.query(
      `SELECT 
        l.id,
        l.license_key,
        l.fk_user_id,
        l.fk_project_id,
        l.status,
        l.device_fingerprint,
        l.fingerprint_bound_at,
        u.user_name,
        u.email,
        u.mobile_number,
        p.title AS project_title
       FROM licenses l
       JOIN users u ON u.id = l.fk_user_id
       JOIN projects p ON p.id = l.fk_project_id
       WHERE l.license_key = $1`,
      [licenseKey]
    );

    if (licenseResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return {
        statuscode: 404,
        successstatus: false,
        status: "Failed",
        message: "License not found"
      };
    }

    const license = licenseResult.rows[0];

    /* ------------------------------------
       2️⃣ CHECK IF FINGERPRINT IS SET
    ------------------------------------ */
    if (!license.device_fingerprint) {
      await client.query("ROLLBACK");
      return {
        statuscode: 400,
        successstatus: false,
        status: "Failed",
        message: "License fingerprint not yet bound (never used)"
      };
    }

    const oldFingerprint = license.device_fingerprint;
    const oldBoundAt = license.fingerprint_bound_at;

    /* ------------------------------------
       3️⃣ RESET FINGERPRINT
    ------------------------------------ */
    await client.query(
      `UPDATE licenses
       SET device_fingerprint = NULL,
           fingerprint_bound_at = NULL
       WHERE id = $1`,
      [license.id]
    );

    /* ------------------------------------
       4️⃣ LOG THE RESET ACTION (AUDIT TRAIL)
    ------------------------------------ */
    // Optional: Create an audit log table for admin actions
    // For now, we'll just log to console
    console.log(`[ADMIN ACTION] Fingerprint reset by admin user ${adminUserId}`);
    console.log(`  License: ${licenseKey}`);
    console.log(`  User: ${license.user_name} (${license.email})`);
    console.log(`  Project: ${license.project_title}`);
    console.log(`  Old Fingerprint: ${oldFingerprint}`);
    console.log(`  Bound At: ${oldBoundAt}`);

    await client.query("COMMIT");

    /* ------------------------------------
       ✅ SUCCESS
    ------------------------------------ */
    return {
      statuscode: 200,
      successstatus: true,
      status: "Success",
      message: "License fingerprint reset successfully",
      data: {
        license_key: license.license_key,
        user: {
          name: license.user_name,
          email: license.email,
          mobile: license.mobile_number
        },
        project: license.project_title,
        previous_fingerprint: oldFingerprint,
        previous_bound_at: oldBoundAt,
        reset_by_admin: adminUserId,
        reset_at: new Date().toISOString()
      }
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = resetLicenseFingerprint;
