const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const os = require("os");

/**
 * =====================================================
 * DOWNLOAD PROJECT ZIP BY LICENSE
 * =====================================================
 * 
 * Downloads project zip based on license key.
 * For mock-train-reservation: Creates dynamic zip with API key in .env
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
        l.license_key,
        p.id AS project_id,
        p.title,
        p.slug,
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
       3️⃣ Check if this is mock-train-reservation project
          If yes, create dynamic zip with API key
    ------------------------------------ */
    const projectRoot = path.join(__dirname, '../../..');
    const isMockTrainProject = license.slug === 'mock-train-reservation' || 
                               license.title?.toLowerCase().includes('mock train');

    if (isMockTrainProject) {
      // Create dynamic zip for mock-train-reservation
      const result = await createMockTrainZip(
        projectRoot,
        license.api_key,
        license.license_key,
        license.title
      );

      if (!result.successstatus) {
        return result;
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

      return {
        statuscode: 200,
        successstatus: true,
        file_path: result.file_path,
        file_name: result.file_name,
        project_type: 'FULL_STACK',
        cleanup: true // Flag to cleanup temp file after download
      };
    }

    /* ------------------------------------
       3️⃣ Determine correct zip path based on project type (for other projects)
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

/**
 * Create dynamic zip for mock-train-reservation project
 * Updates .env with actual API key
 */
async function createMockTrainZip(projectRoot, apiKey, licenseKey, projectTitle) {
  const tempDir = path.join(os.tmpdir(), `mock-train-${Date.now()}`);
  const zipFileName = `Mock_Train_Reservation_${licenseKey}.zip`;
  const zipFilePath = path.join(os.tmpdir(), zipFileName);

  try {
    // Source directories
    const sourceBackend = path.join(projectRoot, 'src/student_projects/mock-train-reservations/student-back-end');
    const sourceFrontend = path.join(projectRoot, 'src/student_projects/mock-train-reservations/student-front-end');

    // Check source directories exist
    if (!fs.existsSync(sourceBackend) || !fs.existsSync(sourceFrontend)) {
      return {
        statuscode: 404,
        successstatus: false,
        status: "Failed",
        message: "Project source files not found"
      };
    }

    // Create temp directory
    fs.mkdirSync(tempDir, { recursive: true });

    // Copy directories (excluding node_modules)
    await copyDirectory(sourceBackend, path.join(tempDir, 'student-back-end'), ['node_modules', '.git', 'logs']);
    await copyDirectory(sourceFrontend, path.join(tempDir, 'student-front-end'), ['node_modules', '.git', 'build']);

    // Update .env file with actual API key
    const envPath = path.join(tempDir, 'student-back-end', '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      // Replace DEMO_API_KEY value with actual API key
      envContent = envContent.replace(
        /DEMO_API_KEY=.*/,
        `DEMO_API_KEY=${apiKey}`
      );
      fs.writeFileSync(envPath, envContent);
    }

    // Create zip file
    await createZipFromDirectory(tempDir, zipFilePath);

    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    return {
      successstatus: true,
      file_path: zipFilePath,
      file_name: zipFileName
    };

  } catch (err) {
    // Cleanup on error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    console.error('Error creating mock train zip:', err);
    return {
      statuscode: 500,
      successstatus: false,
      status: "Failed",
      message: "Failed to prepare project download"
    };
  }
}

/**
 * Copy directory recursively, excluding specified folders
 */
async function copyDirectory(src, dest, excludeFolders = []) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (excludeFolders.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, excludeFolders);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Create zip file from directory
 */
function createZipFromDirectory(sourceDir, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, 'mock-train-reservation');
    archive.finalize();
  });
}

module.exports = downloadProjectZipByLicense;
