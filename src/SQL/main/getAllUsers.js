/**
 * Get all users with pagination and optional search
 * 
 * @param {Object} pool - Database connection pool
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Results per page (default: 20)
 * @param {string} search - Optional search query
 * @returns {Promise<Object>} Paginated users list
 */
const getAllUsers = async (pool, page = 1, limit = 20, search = null) => {
  try {
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [limit, offset];

    if (search) {
      whereClause = `WHERE 
        user_name ILIKE $3 OR 
        email ILIKE $3 OR 
        mobile_number ILIKE $3`;
      params.push(`%${search}%`);
    }

    /* ------------------------------------
       1️⃣ GET TOTAL COUNT
    ------------------------------------ */
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      search ? [params[2]] : []
    );

    const totalUsers = parseInt(countResult.rows[0].total);

    /* ------------------------------------
       2️⃣ GET PAGINATED USERS
    ------------------------------------ */
    const usersResult = await pool.query(
      `SELECT 
        u.id,
        u.user_name,
        u.email,
        u.mobile_number,
        u.is_admin,
        u.created_at,
        COUNT(l.id) as total_licenses,
        COUNT(l.id) FILTER (WHERE l.status = true) as active_licenses,
        COALESCE(SUM(o.payable_amount), 0) as total_spent
       FROM users u
       LEFT JOIN licenses l ON l.fk_user_id = u.id
       LEFT JOIN orders o ON o.fk_user_id = u.id AND o.order_status = 'PAID'
       ${whereClause}
       GROUP BY u.id, u.user_name, u.email, u.mobile_number, u.is_admin, u.created_at
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
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
        users: usersResult.rows.map(user => ({
          id: user.id,
          name: user.user_name,
          email: user.email,
          mobile: user.mobile_number,
          is_admin: user.is_admin,
          joined_date: user.created_at,
          stats: {
            total_licenses: parseInt(user.total_licenses),
            active_licenses: parseInt(user.active_licenses),
            total_spent: parseFloat(user.total_spent)
          }
        }))
      },
      pagination: {
        page: page,
        limit: limit,
        total: totalUsers,
        total_pages: Math.ceil(totalUsers / limit)
      }
    };
  } catch (err) {
    throw err;
  }
};

module.exports = getAllUsers;
