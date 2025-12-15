const updateMockAPICredits = async (
  client,
  fktransactionid,
  recharge_amount,
  mobile_number
) => {
  // 1️⃣ Get user
  const result_user = await client.query(
    `SELECT id FROM serverpe_user WHERE mobile_number = $1`,
    [mobile_number]
  );

  if (result_user.rowCount === 0) {
    throw new Error("User not found");
  }
  //fetch count from recharged amount
  const result_api = await client.query(
    `select id, price_name, api_calls_count from serverpe_apipricing where price=$1`,
    [recharge_amount / 100]
  );
  await client.query(
    `update serverpe_user_apikeywallet set outstanding_apikey_count=$1 where fk_user=$2`,
    [result_api.rows[0].api_calls_count, result_user.rows[0].id]
  );
  await client.query(
    `insert into serverpe_user_apikeywallet_credit () values () returning *`,
    [
      result_user.rows[0].id,
      recharge_amount.rows[0].id,
      recharge_amount.rows[0].price_name,
    ]
  );
};
module.exports = updateMockAPICredits;
