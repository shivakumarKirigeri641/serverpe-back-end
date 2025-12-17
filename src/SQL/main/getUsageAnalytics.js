const getUsageAnalytics = async (client, req) => {
  //total requests
  //avg.latesncy
  //success rate
  //errors
  const result = await client.query(
    `SELECT 
    COUNT(*) AS total_calls,
    ROUND(AVG(NULLIF(latency, 'NaN')),2) AS avg_latency,	
    ROUND(
        (SUM(CASE WHEN apihistory.method = 'GET' THEN 1 ELSE 0 END)::decimal 
        / COUNT(*) * 100), 2
    ) AS get_percentage,

    ROUND(
        (SUM(CASE WHEN apihistory.method = 'POST' THEN 1 ELSE 0 END)::decimal 
        / COUNT(*) * 100), 2
    ) AS post_percentage
FROM serverpe_apihistory apihistory
JOIN serverpe_user suser ON suser.id = apihistory.user_id
WHERE suser.mobile_number = $1;
`,
    [req.mobile_number]
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows[0],
  };
};
module.exports = getUsageAnalytics;
