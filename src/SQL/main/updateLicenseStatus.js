/**
 * Update license status (activate/deactivate)
 * 
 * @param {Object} pool - Database connection pool
 * @param {string} licenseKey - License key to update
 * @param {string} newStatus - New status ('ACTIVE' or 'INACTIVE')
 * @param {number} adminUserId - ID of admin performing the action
 * @returns {Promise<Object>} Update result
 */
const updateLicenseStatus = async (pool, licenseKey, newStatus, adminUserId) => {
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
        l.status as current_status,
        u.user_name,
        u.email,
        p.title as project_title
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
       2️⃣ VALIDATE NEW STATUS
    ------------------------------------ */
    if (!['ACTIVE', 'INACTIVE'].includes(newStatus)) {
      await client.query("ROLLBACK");
      return {
        statuscode: 400,
        successstatus: false,
        status: "Failed",
        message: "Invalid status. Must be ACTIVE or INACTIVE"
      };
    }

    if (license.current_status === newStatus) {
      await client.query("ROLLBACK");
      return {
        statuscode: 400,
        successstatus: false,
        status: "Failed",
        message: `License is already ${newStatus}`
      };
    }

    /* ------------------------------------
       3️⃣ UPDATE STATUS
    ------------------------------------ */
    await client.query(
      `UPDATE licenses
       SET status = $1
       WHERE id = $2`,
      [newStatus, license.id]
    );

    /* ------------------------------------
       4️⃣ LOG ACTION
    ------------------------------------ */
    console.log(`[ADMIN ACTION] License status updated by admin user ${adminUserId}`);
    console.log(`  License: ${licenseKey}`);
    console.log(`  User: ${license.user_name} (${license.email})`);
    console.log(`  Project: ${license.project_title}`);
    console.log(`  Old Status: ${license.current_status} → New Status: ${newStatus}`);

    await client.query("COMMIT");

    /* ------------------------------------
       ✅ SUCCESS
    ------------------------------------ */
    return {
      statuscode: 200,
      successstatus: true,
      status: "Success",
      message: `License ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`,
      data: {
        license_key: license.license_key,
        previous_status: license.current_status,
        new_status: newStatus,
        updated_by_admin: adminUserId,
        updated_at: new Date().toISOString()
      }
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = updateLicenseStatus;
