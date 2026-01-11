/**
 * Get detailed information about a specific license
 * 
 * @param {Object} pool - Database connection pool
 * @param {string} licenseKey - License key to lookup
 * @returns {Promise<Object>} License details
 */
const getLicenseDetails = async (pool, licenseKey) => {
  try {
    /* ------------------------------------
       1️⃣ GET LICENSE INFO
    ------------------------------------ */
    const licenseResult = await pool.query(
      `SELECT 
        l.id,
        l.license_key,
        l.fk_user_id,
        l.fk_project_id,
        l.status,
        l.created_at as license_created_at,
        u.user_name,
        u.email,
        u.mobile_number,
        p.title as project_title,
        p.project_code,
        p.description as project_description
       FROM licenses l
       JOIN users u ON u.id = l.fk_user_id
       JOIN projects p ON p.id = l.fk_project_id
       WHERE l.license_key = $1`,
      [licenseKey]
    );

    if (licenseResult.rowCount === 0) {
      return {
        statuscode: 404,
        successstatus: false,
        status: "Failed",
        message: "License not found"
      };
    }

    const license = licenseResult.rows[0];

    /* ------------------------------------
       2️⃣ GET DOWNLOAD HISTORY
    ------------------------------------ */
    const downloadsResult = await pool.query(
      `SELECT 
        d.id,
        d.download_ip,
        d.created_at as downloaded_at
       FROM downloads d
       WHERE d.fk_license_id = $1
       ORDER BY d.created_at DESC
       LIMIT 10`,
      [license.id]
    );

    /* ------------------------------------
       3️⃣ GET ORDER INFO
    ------------------------------------ */
    const orderResult = await pool.query(
      `SELECT 
        o.order_number,
        o.total_amount,
        o.payable_amount,
        o.gst_amount,
        o.order_status,
        o.created_at as order_date,
        p.gateway_payment_id,
        p.payment_status
       FROM orders o
       LEFT JOIN payments p ON p.fk_order_id = o.id
       JOIN licenses l ON l.fk_user_id = o.fk_user_id AND l.fk_project_id = $1
       WHERE l.id = $2
       ORDER BY o.created_at DESC
       LIMIT 1`,
      [license.fk_project_id, license.id]
    );

    /* ------------------------------------
       ✅ RETURN DETAILED LICENSE INFO
    ------------------------------------ */
    return {
      statuscode: 200,
      successstatus: true,
      status: "Success",
      data: {
        license: {
          license_key: license.license_key,
          status: license.status,
          created_at: license.license_created_at
        },
        user: {
          id: license.fk_user_id,
          name: license.user_name,
          email: license.email,
          mobile: license.mobile_number
        },
        project: {
          id: license.fk_project_id,
          title: license.project_title,
          code: license.project_code,
          description: license.project_description
        },
        order: orderResult.rowCount > 0 ? {
          order_number: orderResult.rows[0].order_number,
          total_amount: parseFloat(orderResult.rows[0].total_amount),
          payable_amount: parseFloat(orderResult.rows[0].payable_amount),
          gst_amount: parseFloat(orderResult.rows[0].gst_amount),
          order_status: orderResult.rows[0].order_status,
          order_date: orderResult.rows[0].order_date,
          payment: {
            gateway_payment_id: orderResult.rows[0].gateway_payment_id,
            status: orderResult.rows[0].payment_status
          }
        } : null,
        download_history: {
          total_downloads: downloadsResult.rowCount,
          recent_downloads: downloadsResult.rows.map(d => ({
            ip: d.download_ip,
            downloaded_at: d.downloaded_at
          }))
        }
      }
    };
  } catch (err) {
    throw err;
  }
};

module.exports = getLicenseDetails;
