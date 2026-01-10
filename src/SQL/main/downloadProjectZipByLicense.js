const path = require("path");
const fs = require("fs");

const downloadProjectZipByLicense = async (
  pool,
  licenseKey,
  mobileNumber,
  downloadIp
) => {
  const client = await pool.connect();

  try {
    /* ------------------------------------
       1️⃣ Validate user by mobile
    ------------------------------------ */
    const userRes = await client.query(
      `SELECT id FROM users WHERE mobile_number = $1`,
      [mobileNumber]
    );

    if (userRes.rowCount === 0) {
      return {
        statuscode: 401,
        successstatus: false,
        status: "Failed",
        message: "Unauthorized user"
      };
    }

    const userId = userRes.rows[0].id;

    /* ------------------------------------
       2️⃣ Validate license ownership
    ------------------------------------ */
    const licenseRes = await client.query(
      `
      SELECT
        l.id AS license_id,
        l.status,
        p.title,
        pv.zip_file_path
      FROM licenses l
      JOIN projects p ON p.id = l.fk_project_id
      JOIN project_versions pv ON pv.fk_project_id = p.id
      WHERE l.license_key = $1
        AND l.fk_user_id = $2
      LIMIT 1
      `,
      [licenseKey, userId]
    );

    if (licenseRes.rowCount === 0) {
      return {
        statuscode: 403,
        successstatus: false,
        status: "Failed",
        message: "Invalid or unauthorized license"
      };
    }

    const license = licenseRes.rows[0];

    if (license.status !== 'ACTIVE') {
      return {
        statuscode: 403,
        successstatus: false,
        status: "Failed",
        message: "License is inactive"
      };
    }

    /* ------------------------------------
       3️⃣ Validate ZIP exists
    ------------------------------------ */
    if (!fs.existsSync(license.zip_file_path)) {
      return {
        statuscode: 404,
        successstatus: false,
        status: "Failed",
        message: "Project file not found"
      };
    }

    /* ------------------------------------
       4️⃣ Log download (ANTI-ABUSE)
    ------------------------------------ */
    await client.query(
      `
      INSERT INTO downloads (
        fk_license_id,
        fk_project_version_id,
        download_ip
      )
      VALUES ($1,
        (SELECT id FROM project_versions
         WHERE fk_project_id = (
           SELECT fk_project_id FROM licenses WHERE license_key = $2
         )
         ORDER BY created_at DESC
         LIMIT 1),
        $3
      )
      `,
      [license.license_id, licenseKey, downloadIp]
    );

    /* ------------------------------------
       ✅ SUCCESS
    ------------------------------------ */
    return {
      statuscode: 200,
      successstatus: true,
      file_path: license.zip_file_path,
      file_name: `${license.title.replace(/\s+/g, "_")}.zip`
    };

  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

module.exports = downloadProjectZipByLicense;
