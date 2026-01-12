const path = require("path");
const fs = require("fs");

/**
 * =====================================================
 * DOWNLOAD PROJECT ZIP BY LICENSE
 * =====================================================
 * 
 * Downloads project zip based on license key.
 * Supports both FULL_STACK and UI_ONLY project types.
 * 
 * @author ServerPE
 */

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
       2️⃣ Validate license and get project info
       Using SELECT * to avoid errors if new columns don't exist yet
    ------------------------------------ */
    const licenseRes = await client.query(
      `
      SELECT
        l.id AS license_id,
        l.status,
        l.api_key,
        p.id AS project_id,
        p.title,
        p.*
      FROM licenses l
      JOIN projects p ON p.id = l.fk_project_id
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
       3️⃣ Determine correct zip path based on project type
    ------------------------------------ */
    let zipFilePath;
    
    if (license.project_type === 'UI_ONLY') {
      zipFilePath = license.zip_path_ui_only;
    } else {
      // Default to FULL_STACK
      zipFilePath = license.zip_path_fullstack;
    }

    // Fallback: Check project_versions table if no direct path
    if (!zipFilePath) {
      const versionRes = await client.query(
        `SELECT zip_file_path FROM project_versions 
         WHERE fk_project_id = $1 
         ORDER BY created_at DESC LIMIT 1`,
        [license.project_id]
      );
      
      if (versionRes.rowCount > 0) {
        zipFilePath = versionRes.rows[0].zip_file_path;
      }
    }

    if (!zipFilePath) {
      return {
        statuscode: 404,
        successstatus: false,
        status: "Failed",
        message: "Project download not available"
      };
    }

    /* ------------------------------------
       4️⃣ Resolve full path and validate file exists
    ------------------------------------ */
    // Navigate to project root (up 3 levels from src/SQL/main)
    const projectRoot = path.join(__dirname, '../../..');
    
    const fullPath = path.isAbsolute(zipFilePath) 
      ? zipFilePath 
      : path.join(projectRoot, zipFilePath);

    if (!fs.existsSync(fullPath)) {
      return {
        statuscode: 404,
        successstatus: false,
        status: "Failed",
        message: "Project file not found",
        debug_path: fullPath 
      };
    }

    /* ------------------------------------
       5️⃣ Log download (ANTI-ABUSE)
    ------------------------------------ */
    await client.query(
      `
      INSERT INTO downloads (
        fk_license_id,
        download_ip
      )
      VALUES ($1, $2)
      `,
      [license.license_id, downloadIp]
    );

    /* ------------------------------------
       ✅ SUCCESS
    ------------------------------------ */
    const projectTypeSuffix = license.project_type === 'UI_ONLY' ? '_UI' : '_FullStack';
    const fileName = `${license.title.replace(/\s+/g, "_")}${projectTypeSuffix}.zip`;

    return {
      statuscode: 200,
      successstatus: true,
      file_path: fullPath,
      file_name: fileName,
      project_type: license.project_type || 'FULL_STACK',
      api_key: (license.project_type || 'FULL_STACK') === 'UI_ONLY' ? license.api_key : null
    };

  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

module.exports = downloadProjectZipByLicense;
