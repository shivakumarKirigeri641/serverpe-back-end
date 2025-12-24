require("dotenv").config();
const DEMO_ALLOWED_ORIGINS = process.env.BASE_UI_URLS.split(",");
module.exports = function demoCorsMiddleware(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"];
    const apiSecret = req.headers["x-secret-key"];

    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const userAgent = (req.headers["user-agent"] || "").toLowerCase();

    const isDemoKey =
      apiKey === process.env.DEMO_API_KEY &&
      apiSecret === process.env.DEMO_SECRET_KEY;

    /* =========================
     DEMO KEY + SECRET RULES
     ========================= */
    if (isDemoKey) {
      const allowed = DEMO_ALLOWED_ORIGINS.some(
        (domain) => origin === domain || referer?.startsWith(domain)
      );

      if (!allowed) {
        return res.status(403).json({
          poweredby: "serverpe.in",
          mock_data: true,
          error:
            "Demo API access is allowed only from ServerPe sample UI domains",
        });
      }

      // Block Postman / curl / non-browser
      if (
        !userAgent ||
        userAgent.includes("postman") ||
        userAgent.includes("curl")
      ) {
        return res.status(403).json({
          poweredby: "serverpe.in",
          mock_data: true,
          error: "Demo API keys are browser-only",
        });
      }

      // Allow CORS only for valid origin
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
    } else {
      /* =========================
     PAID USERS
     ========================= */
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
    }

    /* =========================
     COMMON CORS HEADERS
     ========================= */
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, X-API-KEY, X-API-SECRET, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  } catch (err) {
    console.log("demo middleware error:", err.message);
  }
};
