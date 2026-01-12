const { getIpDetails } = require('../utils/geoUtils');
const { getMainPool } = require('../database/connectDB');

/**
 * Middleware to log API requests and responses
 */
const apiLogger = async (req, res, next) => {
  // Skip logging for health check, images, or non-api routes if desired
  if (req.path === '/' || req.path.startsWith('/images/')) {
    return next();
  }

  const start = Date.now();
  const pool = getMainPool();
  
  // Extract info before response finishes
  const { method, path, query, body, headers } = req;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Use res.on('finish') to capture status code and latency after response is sent
  res.on('finish', async () => {
    try {
      const latencyMs = Date.now() - start;
      const statusCode = res.statusCode;
      const userId = req.user ? req.user.id : null;

      // 1. Handle IP details (Insert or fetch ID)
      let ipDetailsId = null;
      try {
        const ipLookup = await getIpDetails(ipAddress);
        
        // Try to find existing IP
        const existingIp = await pool.query('SELECT id FROM ip_details WHERE ip_address = $1', [ipAddress]);
        
        if (existingIp.rows.length > 0) {
          ipDetailsId = existingIp.rows[0].id;
        } else {
          // Insert new IP details
          const insertIp = await pool.query(
            `INSERT INTO ip_details (ip_address, status, city, region_name, country, isp, org, timezone, query)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [
              ipAddress,
              ipLookup.status,
              ipLookup.city,
              ipLookup.regionName,
              ipLookup.country,
              ipLookup.isp,
              ipLookup.org,
              ipLookup.timezone,
              ipLookup.query
            ]
          );
          ipDetailsId = insertIp.rows[0].id;
        }
      } catch (ipErr) {
        console.error("Error logging IP details:", ipErr.message);
      }

      // 2. Insert API log entry
      await pool.query(
        `INSERT INTO api_logs (method, path, query_params, body, headers, status_code, latency_ms, fk_ip_details_id, fk_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          method,
          path,
          JSON.stringify(query),
          JSON.stringify(body),
          JSON.stringify(headers),
          statusCode,
          latencyMs,
          ipDetailsId,
          userId
        ]
      );

    } catch (logErr) {
      console.error("Error recording API log:", logErr.message);
    }
  });

  next();
};

module.exports = apiLogger;
