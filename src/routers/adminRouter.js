const express = require("express");
const adminRouter = express.Router();
const checkAdmin = require("../middleware/checkAdmin");
const { getMainPool } = require("../database/connectDB");

// Import SQL functions
const getPlatformStatistics = require("../SQL/main/getPlatformStatistics");
const getAllUsers = require("../SQL/main/getAllUsers");
const getLicenseDetails = require("../SQL/main/getLicenseDetails");
const getAllLicenses = require("../SQL/main/getAllLicenses");
const updateLicenseStatus = require("../SQL/main/updateLicenseStatus");

// Apply admin authentication to ALL routes
adminRouter.use(checkAdmin);

/* ============================================================
   📊 ANALYTICS & STATISTICS
============================================================ */

/**
 * GET /admin/analytics/overview
 * Get platform overview statistics
 */
adminRouter.get("/analytics/overview", async (req, res) => {
  try {
    const pool = getMainPool();
    const result = await getPlatformStatistics(pool);

    res.status(result.statuscode).json({
      poweredby: "serverpe.in",
      status: result.status,
      successstatus: result.successstatus,
      data: result.data
    });
  } catch (error) {
    console.error("Error fetching platform statistics:");
    console.error(error);
    res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "Failed to fetch statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/* ============================================================
   🔑 LICENSE MANAGEMENT
============================================================ */

/**
 * GET /admin/licenses
 * Get all licenses with pagination and filtering
 * Query params: page, limit, status (ACTIVE/INACTIVE), bound (true/false), search
 */
adminRouter.get("/licenses", async (req, res) => {
  try {
    const pool = getMainPool();
    const { page, limit, status, search } = req.query;

    const result = await getAllLicenses(pool, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status,
      search
    });

    res.status(result.statuscode).json({
      poweredby: "serverpe.in",
      status: result.status,
      successstatus: result.successstatus,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("Error fetching licenses:", error);
    res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "Failed to fetch licenses"
    });
  }
});

/**
 * GET /admin/licenses/:license_key
 * Get specific license details
 */
adminRouter.get("/licenses/:license_key", async (req, res) => {
  try {
    const pool = getMainPool();
    const { license_key } = req.params;

    const result = await getLicenseDetails(pool, license_key);

    res.status(result.statuscode).json({
      poweredby: "serverpe.in",
      status: result.status,
      successstatus: result.successstatus,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("Error fetching license details:", error);
    res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "Failed to fetch license details"
    });
  }
});

/**
 * POST /admin/licenses/:license_key/deactivate
 * Deactivate a license
 */
adminRouter.post("/licenses/:license_key/deactivate", async (req, res) => {
  try {
    const pool = getMainPool();
    const { license_key } = req.params;
    const adminUserId = req.user.id;

    const result = await updateLicenseStatus(pool, license_key, 'INACTIVE', adminUserId);

    res.status(result.statuscode).json({
      poweredby: "serverpe.in",
      status: result.status,
      successstatus: result.successstatus,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("Error deactivating license:", error);
    res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "Failed to deactivate license"
    });
  }
});

/**
 * POST /admin/licenses/:license_key/activate
 * Activate a license
 */
adminRouter.post("/licenses/:license_key/activate", async (req, res) => {
  try {
    const pool = getMainPool();
    const { license_key } = req.params;
    const adminUserId = req.user.id;

    const result = await updateLicenseStatus(pool, license_key, 'ACTIVE', adminUserId);

    res.status(result.statuscode).json({
      poweredby: "serverpe.in",
      status: result.status,
      successstatus: result.successstatus,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("Error activating license:", error);
    res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "Failed to activate license"
    });
  }
});

/* ============================================================
   👥 USER MANAGEMENT
============================================================ */

/**
 * GET /admin/users
 * Get all users with pagination and optional search
 * Query params: page, limit, search
 */
adminRouter.get("/users", async (req, res) => {
  try {
    const pool = getMainPool();
    const { page, limit, search } = req.query;

    const result = await getAllUsers(
      pool,
      parseInt(page) || 1,
      parseInt(limit) || 20,
      search
    );

    res.status(result.statuscode).json({
      poweredby: "serverpe.in",
      status: result.status,
      successstatus: result.successstatus,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "Failed to fetch users"
    });
  }
});

/**
 * GET /admin/users/:user_id/purchases
 * Get specific user's purchase history
 */
adminRouter.get("/users/:user_id/purchases", async (req, res) => {
  try {
    const pool = getMainPool();
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT 
        l.license_key,
        l.status,
        l.created_at as purchased_at,
        p.title as project_title,
        p.project_code,
        o.order_number,
        o.payable_amount,
        COUNT(d.id) as download_count
       FROM licenses l
       JOIN projects p ON p.id = l.fk_project_id
       LEFT JOIN orders o ON o.fk_user_id = l.fk_user_id AND o.fk_user_id = $1
       LEFT JOIN downloads d ON d.fk_license_id = l.id
       WHERE l.fk_user_id = $1
       GROUP BY l.license_key, l.status, l.created_at,
                p.title, p.project_code, o.order_number, o.payable_amount
       ORDER BY l.created_at DESC`,
      [user_id]
    );

    res.status(200).json({
      poweredby: "serverpe.in",
      status: "Success",
      successstatus: true,
      data: {
        purchases: result.rows
      }
    });
  } catch (error) {
    console.error("Error fetching user purchases:", error);
    res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "Failed to fetch user purchases"
    });
  }
});

/**
 * POST /admin/users/:user_id/make-admin
 * Grant admin privileges to a user
 */
adminRouter.post("/users/:user_id/make-admin", async (req, res) => {
  try {
    const pool = getMainPool();
    const { user_id } = req.params;

    await pool.query(
      `UPDATE users SET is_admin = true WHERE id = $1`,
      [user_id]
    );

    console.log(`[ADMIN ACTION] Admin privileges granted to user ${user_id} by admin ${req.user.id}`);

    res.status(200).json({
      poweredby: "serverpe.in",
      status: "Success",
      successstatus: true,
      message: "Admin privileges granted successfully"
    });
  } catch (error) {
    console.error("Error granting admin privileges:", error);
    res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "Failed to grant admin privileges"
    });
  }
});

/**
 * POST /admin/users/:user_id/remove-admin
 * Revoke admin privileges from a user
 */
adminRouter.post("/users/:user_id/remove-admin", async (req, res) => {
  try {
    const pool = getMainPool();
    const { user_id } = req.params;

    // Prevent removing own admin privileges
    if (parseInt(user_id) === req.user.id) {
      return res.status(400).json({
        poweredby: "serverpe.in",
        status: "Failed",
        successstatus: false,
        message: "Cannot remove your own admin privileges"
      });
    }

    await pool.query(
      `UPDATE users SET is_admin = false WHERE id = $1`,
      [user_id]
    );

    console.log(`[ADMIN ACTION] Admin privileges revoked from user ${user_id} by admin ${req.user.id}`);

    res.status(200).json({
      poweredby: "serverpe.in",
      status: "Success",
      successstatus: true,
      message: "Admin privileges revoked successfully"
    });
  } catch (error) {
    console.error("Error revoking admin privileges:", error);
    res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "Failed to revoke admin privileges"
    });
  }
});

/**
 * GET /admin/system/health
 * System health check
 */
adminRouter.get("/system/health", async (req, res) => {
  try {
    const pool = getMainPool();
    await pool.query("SELECT 1");

    res.status(200).json({
      poweredby: "serverpe.in",
      status: "Success",
      successstatus: true,
      data: {
        database: "connected",
        server: "running",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "System health check failed"
    });
  }
});

/**
 * GET /admin/api-logs
 * Get API call logs with pagination and filters
 * Query params: page, limit, method, statusCode, startDate, endDate
 */
adminRouter.get("/api-logs", async (req, res) => {
  try {
    const pool = getMainPool();
    const { page, limit, method, statusCode, startDate, endDate } = req.query;
    
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 20;
    const offset = (p - 1) * l;

    let query = `
      SELECT 
        al.id, al.method, al.path, al.query_params, al.body, al.headers, 
        al.status_code, al.latency_ms, al.created_at,
        idp.ip_address, idp.city, idp.region_name, idp.country, idp.isp,
        u.user_name as user_name
      FROM api_logs al
      LEFT JOIN ip_details idp ON al.fk_ip_details_id = idp.id
      LEFT JOIN users u ON al.fk_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (method) {
      params.push(method);
      query += ` AND al.method = $${params.length}`;
    }
    if (statusCode) {
      params.push(parseInt(statusCode));
      query += ` AND al.status_code = $${params.length}`;
    }
    if (startDate) {
      params.push(startDate);
      query += ` AND al.created_at >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND al.created_at <= $${params.length}`;
    }

    // Get total count for pagination
    const countResult = await pool.query(`SELECT COUNT(*) FROM (${query}) as sub`, params);
    const totalCount = parseInt(countResult.rows[0].count);

    query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(l, offset);

    const result = await pool.query(query, params);

    res.status(200).json({
      poweredby: "serverpe.in",
      status: "Success",
      successstatus: true,
      data: result.rows,
      pagination: {
        total: totalCount,
        page: p,
        limit: l,
        totalPages: Math.ceil(totalCount / l)
      }
    });
  } catch (error) {
    console.error("Error fetching api logs:", error);
    res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "Failed to fetch api logs"
    });
  }
});

module.exports = adminRouter;
