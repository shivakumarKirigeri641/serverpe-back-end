const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const os = require("os");
const doc = require("pdfkit");

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
  client,
  licenseKey,
  mobileNumber,
  downloadIp,
) => {
  try {
    /* ------------------------------------
       1️⃣ Validate user by mobile
    ------------------------------------ */
    const userRes = await client.query(
      `SELECT *from users WHERE mobile_number = $1`,
      [mobileNumber],
    );

    if (userRes.rowCount === 0) {
      return {
        statuscode: 401,
        successstatus: false,
        status: "Failed",
        message: "Unauthorized user",
      };
    }
    const userId = userRes.rows[0].id;

    /* ------------------------------------
       2️⃣ Validate license and get project info
       Using SELECT * to avoid errors if new columns don't exist yet
    ------------------------------------ */
    const licenseRes = await client.query(
      `
      SELECT *FROM licenses where license_key= $1`,
      [licenseKey],
    );

    if (licenseRes.rowCount === 0) {
      return {
        statuscode: 403,
        successstatus: false,
        status: "Failed",
        message: "Invalid or unauthorized license",
      };
    }

    const license = licenseRes.rows[0];

    if (license.status !== true) {
      return {
        statuscode: 403,
        successstatus: false,
        status: "Failed",
        message: "License is inactive",
      };
    }
    //license seems good

    //project
    const result_project = await client.query(
      `SELECT *FROM projects WHERE id = $1`,
      [license.fk_project_id],
    );
    //project version
    const result_project_versions = await client.query(
      `SELECT *FROM project_versions WHERE fk_project_id = $1`,
      [license.fk_project_id],
    );

    const projectRoot = path.join(__dirname, "../../..");
    // Create dynamic zip for mock-train-reservation
    const result = await createMockTrainZip(
      projectRoot,
      license.api_key,
      license.license_key,
      result_project.rows[0].title,
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
          fk_project_version_id,
          download_ip
        )
        VALUES ($1, $2,$3)
        `,
      [license.id, result_project_versions.rows[0].id, downloadIp],
    );
    return {
      statuscode: 200,
      successstatus: true,
      file_path: result.file_path,
      file_name: result.file_name,
      project_type: "FULL_STACK",
      cleanup: true, // Flag to cleanup temp file after download
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Create dynamic zip for mock-train-reservation project
 * Updates .env with actual API key
 */
async function createMockTrainZip(
  projectRoot,
  apiKey,
  licenseKey,
  projectTitle,
) {
  const tempDir = path.join(os.tmpdir(), `mock-train-${Date.now()}`);
  const zipFileName = `Mock_Train_Reservation_${licenseKey}.zip`;
  const zipFilePath = path.join(os.tmpdir(), zipFileName);

  try {
    // Source directories
    const sourceBackend = path.join(
      projectRoot,
      "src/student_projects/mock-train-reservations/student-back-end",
    );
    const sourceFrontend = path.join(
      projectRoot,
      "src/student_projects/mock-train-reservations/student-front-end",
    );
    const docs = path.join(
      projectRoot,
      "src/student_projects/mock-train-reservations/docs",
    );
    const start_all_batFile = path.join(
      projectRoot,
      "src/student_projects/mock-train-reservations/start_all.bat",
    );

    // Check source directories exist
    if (
      !fs.existsSync(sourceBackend) ||
      !fs.existsSync(sourceFrontend) ||
      !fs.existsSync(docs)
    ) {
      return {
        statuscode: 404,
        successstatus: false,
        status: "Failed",
        message: "Project source files not found",
      };
    }

    // Create temp directory
    fs.mkdirSync(tempDir, { recursive: true });

    // Copy directories (excluding node_modules)
    await copyDirectory(sourceBackend, path.join(tempDir, "student-back-end"), [
      "node_modules",
      ".git",
      "logs",
    ]);
    await copyDirectory(
      sourceFrontend,
      path.join(tempDir, "student-front-end"),
      ["node_modules", ".git", "build"],
    );
    await copyDirectory(docs, path.join(tempDir, "docs"), []);
    await copyFile(start_all_batFile, tempDir, []);

    // Update .env file with actual API key
    const envPath = path.join(tempDir, "student-back-end", ".env");
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf8");
      // Replace DEMO_API_KEY value with actual API key
      envContent = envContent.replace(
        /DEMO_API_KEY=.*/,
        `DEMO_API_KEY=${apiKey}`,
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
      file_name: zipFileName,
    };
  } catch (err) {
    // Cleanup on error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    console.error("Error creating mock train zip:", err);
    return {
      statuscode: 500,
      successstatus: false,
      status: "Failed",
      message: "Failed to prepare project download",
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
async function copyFile(srcFile, destDir, excludeFiles = []) {
  const fileName = path.basename(srcFile);

  if (excludeFiles.includes(fileName)) {
    return;
  }

  // Ensure destination directory exists
  fs.mkdirSync(destDir, { recursive: true });

  // Create full destination path
  const destPath = path.join(destDir, fileName);
  fs.copyFileSync(srcFile, destPath);
}

/**
 * Create zip file from directory
 */
function createZipFromDirectory(sourceDir, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, "mock-train-reservation");
    archive.finalize();
  });
}

module.exports = downloadProjectZipByLicense;
