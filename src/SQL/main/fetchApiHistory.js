const fetchApiHistory = async (client, mobile_number) => {
  try {
    const result_user = await client.query(
      `select id from serverpe_user where mobile_number=$1`,
      [mobile_number]
    );
    // 1️⃣ WEEKLY STATISTICS
    const weeklyStatsQuery = `
      WITH week_days AS (
    SELECT unnest(ARRAY[
        'Mon','Tue','Wed','Thu','Fri','Sat','Sun'
    ]) AS day,
    generate_series(1,7) AS day_order
),
logs AS (
    SELECT 
        TO_CHAR(created_at, 'Dy') AS day,
        COUNT(*) AS calls,
        COUNT(*) FILTER (WHERE response_status >= 400) AS errors
    FROM serverpe_apihistory
    WHERE created_at >= date_trunc('week', CURRENT_DATE)
      AND user_id = $1
    GROUP BY day
)
SELECT 
    wd.day,
    COALESCE(l.calls, 0) AS calls,
    COALESCE(l.errors, 0) AS errors
FROM week_days wd
LEFT JOIN logs l ON l.day = wd.day
ORDER BY wd.day_order;

    `;

    const weeklyStatsResult = await client.query(weeklyStatsQuery, [
      result_user.rows[0].id,
    ]);

    const mockStats = weeklyStatsResult.rows.map((r) => ({
      day: r.day,
      calls: Number(r.calls),
      errors: Number(r.errors),
    }));

    // 2️⃣ RECENT LOGS
    const logsQuery = `
      SELECT 
        id,
        method,
        endpoint,
        response_status AS status,
        latency,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS time,
        ip_address AS ip
      FROM serverpe_apihistory
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10;
    `;

    const logsResult = await client.query(logsQuery, [result_user.rows[0].id]);
    const mockLogs = logsResult.rows.map((r) => ({
      id: r.id,
      method: r.method,
      endpoint: r.endpoint,
      status: r.status,
      latency: r.latency + "ms",
      time: r.time,
      ip: r.ip,
    }));

    // 3️⃣ FINAL RETURN (same style as your file)
    return {
      statuscode: 200,
      successstatus: true,
      data: {
        mockStats,
        mockLogs,
      },
      message: "Stats & logs fetched successfully.",
    };
  } catch (err) {
    console.error("fetchMockStatsAndLogs error:", err);
    return {
      statuscode: 500,
      successstatus: false,
      message: "Failed to fetch stats/logs.",
    };
  }
};
module.exports = fetchApiHistory;
