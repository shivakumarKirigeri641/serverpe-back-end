const updateApiUsage = async (client, req, res) => {
  const apiKey = req.headers["x-api-key"];
  const secretKey = req.headers["x-secret-key"];
  const result_user_details = await client.query(
    `select *from serverpe_user where apikey_text = $1 and secret_key=$2`,
    [apiKey, secretKey]
  );
  //endpoint
  let endpoint = req.protocol + "://" + req.get("host") + req.originalUrl;
  const method = req.method;
  const user_agent = req.headers["user-agent"];
  const reqbody = !req.body ? null : req.body;
  const rescode = res.statusCode;
  const ipaddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || // real client IP if behind proxy
    req.socket.remoteAddress || // direct connection
    null;
  console.log(endpoint, method, user_agent, reqbody, rescode, ipaddress);

  //insert these to api history everytime
  await client.query(
    `insert into serverpe_apihistory (user_id, endpoint, method, request_body, response_status, ip_address, user_agent) values ($1,$2,$3,$4,$5,$6,$7)`,
    [
      result_user_details.rows[0].id,
      endpoint,
      method,
      reqbody,
      rescode,
      ipaddress,
      user_agent,
    ]
  );
};
module.exports = updateApiUsage;
