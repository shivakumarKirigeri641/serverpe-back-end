/**
 * Get all licenses with pagination and filtering
 * 
 * @param {Object} pool - Database connection pool
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated licenses list
 */
const getAllLicenses = async (
  pool,
  { page = 1, limit = 20, status = null, bound = null, search = null } = {}
) => {
  try {
    const offset = (page - 1) * limit;
    const params = [];
    const whereClauses = [];

    // Build WHERE clauses
    if (status) {
      whereClauses.push(`l.status = $${params.length + 1}`);
      params.push(status);
    }

    if (bound === 'true' || bound === true) {
      whereClauses.push(`l.device_fingerprint IS NOT NULL`);
    } else if (bound === 'false' || bound === false) {
      whereClauses.push(`l.device_fingerprint IS NULL`);
    }

    if (search) {
      whereClauses.push(`(
        l.license_key ILIKE $${params.length + 1} OR
        u.user_name ILIKE $${params.length + 1} OR
        u.email ILIKE $${params.length + 1} OR
        p.title ILIKE $${params.length + 1}
      )`);
      params.push(`%${search}%`);
    }

    const whereClause = whereClauses.length > 0 
      ? `WHERE ${whereClauses.join(' AND ')}`
      : '';

    /* ------------------------------------
       1️⃣ GET TOTAL COUNT
    ------------------------------------ */
    const countResult = await pool.query(
      `SELECT COUNT(*) as total 
       FROM licenses l
       JOIN users u ON u.id = l.fk_user_id
       JOIN projects p ON p.id = l.fk_project_id
       ${whereClause}`,
      params
    );

    const totalLicenses = parseInt(countResult.rows[0].total);

    /* ------------------------------------
       2️⃣ GET PAGINATED LICENSES
    ------------------------------------ */
    params.push(limit);
    params.push(offset);

    const licensesResult = await pool.query(
      `SELECT 
        l.license_key,
        l.status,
        l.device_fingerprint,
        l.fingerprint_bound_at,
        l.created_at,
        u.user_name,
        u.email,
        p.title as project_title,
        p.project_code,
        COUNT(d.id) as download_count
       FROM licenses l
       JOIN users u ON u.id = l.fk_user_id
       JOIN projects p ON p.id = l.fk_project_id
       LEFT JOIN downloads d ON d.fk_license_id = l.id
       ${whereClause}
       GROUP BY l.license_key, l.status, l.device_fingerprint, l.fingerprint_bound_at, 
                l.created_at, u.user_name, u.email, p.title, p.project_code
       ORDER BY l.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    /* ------------------------------------
       ✅ RETURN PAGINATED RESULTS
    ------------------------------------ */
    return {
      statuscode: 200,
      successstatus: true,
      status: "Success",
      data: {
        licenses: licensesResult.rows.map(lic => ({
          license_key: lic.license_key,
          status: lic.status,
          is_bound: !!lic.device_fingerprint,
          bound_at: lic.fingerprint_bound_at,
          created_at: lic.created_at,
          user: {
            name: lic.user_name,
            email: lic.email
          },
          project: {
            title: lic.project_title,
            code: lic.project_code
          },
          download_count: parseInt(lic.download_count)
        }))
      },
      pagination: {
        page: page,
        limit: limit,
        total: totalLicenses,
        total_pages: Math.ceil(totalLicenses / limit)
      }
    };
  } catch (err) {
    throw err;
  }
};

module.exports = getAllLicenses;
