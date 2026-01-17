/**
 * Get platform statistics and overview
 * Returns key metrics for admin dashboard
 * 
 * @param {Object} pool - Database connection pool
 * @returns {Promise<Object>} Platform statistics
 */
const getPlatformStatistics = async (pool) => {
  try {
    /* ------------------------------------
       1️⃣ TOTAL USERS
    ------------------------------------ */
    const usersResult = await pool.query(`
      SELECT COUNT(*) as users
      FROM users
    `);

    /* ------------------------------------
       2️⃣ TOTAL LICENSES & REVENUE
    ------------------------------------ */
    const licensesResult = await pool.query(`
      SELECT 
        COUNT(*) as licenses,
        COUNT(*) FILTER (WHERE status = true) as active_licenses,
        COUNT(*) FILTER (WHERE status = false) as inactive_licenses
      FROM licenses
    `);

    /* ------------------------------------
       3️⃣ REVENUE STATISTICS
    ------------------------------------ */
    const revenueResult = await pool.query(`
      SELECT 
        COUNT(*) as orders,
        COALESCE(SUM(payable_amount), 0) as revenue,
        COALESCE(AVG(payable_amount), 0) as avg_order_value
      FROM orders
      WHERE order_status = 'PAID'
    `);

    /* ------------------------------------
       4️⃣ RECENT ACTIVITY (Last 7 days)
    ------------------------------------ */
    const recentActivity = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_7d,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d
      FROM users
    `);

    const recentSales = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as sales_7d,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as sales_30d,
        COALESCE(SUM(payable_amount) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'), 0) as revenue_7d,
        COALESCE(SUM(payable_amount) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0) as revenue_30d
      FROM orders
      WHERE order_status = 'PAID'
    `);

    /* ------------------------------------
       5️⃣ PROJECTS STATISTICS
    ------------------------------------ */
    const projectsResult = await pool.query(`
      SELECT COUNT(*) as projects
      FROM projects
    `);

    /* ------------------------------------
       6️⃣ DOWNLOADS STATISTICS (Optional - table may not exist)
    ------------------------------------ */
    let downloadsResult;
    try {
      downloadsResult = await pool.query(`
        SELECT 
          COUNT(*) as downloads,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as downloads_7d,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as downloads_30d
        FROM downloads
      `);
    } catch (err) {
      // Downloads table doesn't exist - use zero values
      downloadsResult = {
        rows: [{
          downloads: 0,
          downloads_7d: 0,
          downloads_30d: 0
        }]
      };
    }

    /* ------------------------------------
       ✅ COMBINE ALL STATISTICS
    ------------------------------------ */
    return {
      statuscode: 200,
      successstatus: true,
      status: "Success",
      data: {
        users: {
          total: parseInt(usersResult.rows[0].users),
          new_last_7_days: parseInt(recentActivity.rows[0].new_users_7d),
          new_last_30_days: parseInt(recentActivity.rows[0].new_users_30d)
        },
        licenses: {
          total: parseInt(licensesResult.rows[0].licenses),
          active: parseInt(licensesResult.rows[0].active_licenses),
          inactive: parseInt(licensesResult.rows[0].inactive_licenses)
        },
        revenue: {
          total_orders: parseInt(revenueResult.rows[0].orders),
          total_revenue: parseFloat(revenueResult.rows[0].revenue),
          average_order_value: parseFloat(revenueResult.rows[0].avg_order_value),
          last_7_days: parseFloat(recentSales.rows[0].revenue_7d),
          last_30_days: parseFloat(recentSales.rows[0].revenue_30d)
        },
        sales: {
          last_7_days: parseInt(recentSales.rows[0].sales_7d),
          last_30_days: parseInt(recentSales.rows[0].sales_30d)
        },
        projects: {
          total: parseInt(projectsResult.rows[0].projects)
        },
        downloads: {
          total: parseInt(downloadsResult.rows[0].downloads),
          last_7_days: parseInt(downloadsResult.rows[0].downloads_7d),
          last_30_days: parseInt(downloadsResult.rows[0].downloads_30d)
        },
        generated_at: new Date().toISOString()
      }
    };
  } catch (err) {
    throw err;
  }
};

module.exports = getPlatformStatistics;
