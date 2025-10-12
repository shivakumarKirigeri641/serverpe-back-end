// Middleware factory: accepts a client or pg.Pool
function createRequestLogger(client) {
  function getClientIp(req) {
    let ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      null;

    if (!ip) return { ip: null, version: "Unknown", type: "Unknown" };

    if (ip.includes(",")) ip = ip.split(",")[0].trim();

    let version = ip.includes(":") ? "IPv6" : "IPv4";
    let type = ip === "127.0.0.1" || ip === "::1" ? "Local" : "External";
    ip = ip.replace("::ffff:", "");

    return { ip, version, type };
  }

  // Actual Express middleware function
  return async function requestLogger(req, res, next) {
    const { ip, version, type } = getClientIp(req);
    const route = req.originalUrl || req.url;
    const method = req.method;
    const userAgent = req.headers["user-agent"] || "Unknown";

    try {
      await client.query(
        `INSERT INTO request_logs (ip_address, ip_version, ip_type, route, method, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [ip, version, type, route, method, userAgent]
      );
    } catch (err) {
      console.error("Error logging request:", err.message);
    }

    next();
  };
}

module.exports = createRequestLogger;
