// Atomic + Wallet-based updateApiUsage.js
// Safe for concurrency and rapid clicking

const updateApiUsage = async (client, req, start) => {
  const apiKey = req.headers["x-api-key"];
  const secretKey = req.headers["x-secret-key"];

  //check if demo key, then return ok
  const isDemoKey =
    apiKey === process.env.DEMO_API_KEY &&
    secretKey === process.env.DEMO_SECRET_KEY;
  if (isDemoKey) {
    return {
      ok: true,
      remaining: null,
      userId: null,
    };
  }
  if (!apiKey || !secretKey) {
    return { ok: false, message: "API key and secret key required" };
  }

  // 1️⃣ Fetch user
  const userRes = await client.query(
    `SELECT id FROM serverpe_user 
     WHERE apikey_text = $1 AND secret_key = $2`,
    [apiKey, secretKey]
  );

  if (userRes.rows.length === 0) {
    return { ok: false, message: "Invalid API key or secret key" };
  }

  const userId = userRes.rows[0].id;

  // 2️⃣ Fetch wallet for this user
  const walletRes = await client.query(
    `SELECT outstanding_apikey_count_free, outstanding_apikey_count
     FROM serverpe_user_apikeywallet
     WHERE fk_user = $1`,
    [userId]
  );

  if (walletRes.rows.length === 0) {
    return { ok: false, message: "Wallet not found" };
  }

  let { outstanding_apikey_count_free, outstanding_apikey_count } =
    walletRes.rows[0];

  let remainingAfterUpdate = 0;

  // ------------------------------
  // 3️⃣ ATOMIC UPDATE: FREE FIRST
  // ------------------------------
  if (outstanding_apikey_count_free > 0) {
    const freeUpdateRes = await client.query(
      `UPDATE serverpe_user_apikeywallet
       SET outstanding_apikey_count_free = outstanding_apikey_count_free - 1
       WHERE fk_user = $1
         AND outstanding_apikey_count_free > 0
       RETURNING outstanding_apikey_count_free AS remaining`,
      [userId]
    );

    if (freeUpdateRes.rows.length > 0) {
      remainingAfterUpdate = freeUpdateRes.rows[0].remaining;
    } else {
      outstanding_apikey_count_free = 0;
    }
  }

  // ------------------------------
  // 4️⃣ ATOMIC UPDATE: PAID NEXT
  // ------------------------------
  if (remainingAfterUpdate === 0 && outstanding_apikey_count_free === 0) {
    if (outstanding_apikey_count > 0) {
      const paidUpdateRes = await client.query(
        `UPDATE serverpe_user_apikeywallet
         SET outstanding_apikey_count = outstanding_apikey_count - 1
         WHERE fk_user = $1
           AND outstanding_apikey_count > 0
         RETURNING outstanding_apikey_count AS remaining`,
        [userId]
      );

      if (paidUpdateRes.rows.length > 0) {
        remainingAfterUpdate = paidUpdateRes.rows[0].remaining;
      } else {
        return { ok: false, message: "API usage exhausted. Please recharge." };
      }
    } else {
      return { ok: false, message: "API usage exhausted. Please recharge." };
    }
  }

  // ------------------------------
  // 5️⃣ SAFE HISTORY INSERT
  // with latency_ms added
  // ------------------------------
  const endpoint = req.protocol + "://" + req.get("host") + req.originalUrl;
  const method = req.method;
  const userAgent = req.headers["user-agent"] || null;
  const requestBody = req.method === "GET" ? null : req.body || null;
  const ipAddress =
    (req.headers["x-forwarded-for"] &&
      req.headers["x-forwarded-for"].split(",")[0]) ||
    req.socket?.remoteAddress ||
    null;

  const latency = Date.now() - start;

  (async () => {
    try {
      await client.query(
        `INSERT INTO serverpe_apihistory
        (user_id, endpoint, method, request_body, response_status, ip_address, user_agent, latency)
        VALUES ($1,$2,$3,$4,200,$5,$6,$7)`,
        [
          userId,
          endpoint,
          method,
          requestBody,
          ipAddress,
          userAgent,
          latency, // ⬅️ ADD latency here
        ]
      );
    } catch (err) {
      console.error("API History Insert Failed:", err.message);
    }
  })();

  // ------------------------------
  // 6️⃣ RETURN RESULT
  // ------------------------------
  return {
    ok: true,
    remaining: remainingAfterUpdate,
    userId,
  };
};

module.exports = updateApiUsage;
