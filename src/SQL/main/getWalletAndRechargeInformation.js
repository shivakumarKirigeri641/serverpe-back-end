const getWalletAndRechargeInformation = async (client, req) => {
  const result_userdetails = await client.query(
    `select *from serverpe_user where mobile_number=$1`,
    [req.mobile_number]
  );
  //credit details
  const result_latestdetails = await client.query(
    `select suser.mobile_number, suser.created_at as member_since, suser.updated_at as last_login, wallet.outstanding_apikey_count_free, wallet.outstanding_apikey_count, plan.price, plan.price_name from serverpe_apipricing plan 
    left join serverpe_user_apikeywallet_credit credit on credit.fk_pricing = plan.id
    join serverpe_user suser on suser.id = credit.fk_user    
    join serverpe_user_apikeywallet wallet on wallet.fk_user = suser.id
    where suser.mobile_number=$1 order by credit.created_at desc limit 1;`,
    [req.mobile_number]
  );
  //membe sicnce

  //debit
  const result_debits = await client.query(
    `SELECT
    apihistory.id AS debit_id,
    apihistory.created_at AS debited_on,
    apihistory.transaction_type,
    apihistory.api_call_deduction,
    apihistory.response_status,
    apihistory.ip_address,
    apihistory.user_agent
FROM serverpe_user suser
JOIN serverpe_apihistory apihistory
    ON apihistory.user_id = suser.id

WHERE suser.mobile_number = $1
ORDER BY apihistory.created_at DESC;
`,
    [req.mobile_number]
  );
  //credit
  const result_credits = await client.query(
    `SELECT
    credit.id AS credit_id,
    credit.created_at AS credited_on,
    pricing.price,
    pricing.api_calls_count,
    pricing.price_name    
FROM serverpe_user suser
JOIN serverpe_user_apikeywallet_credit credit
    ON credit.fk_user = suser.id
LEFT JOIN serverpe_apipricing pricing
    ON pricing.id = credit.fk_pricing
JOIN serverpe_user_apikeywallet wallet
    ON wallet.fk_user = suser.id
WHERE suser.mobile_number = $1
ORDER BY credit.created_at DESC;
`,
    [req.mobile_number]
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: {
      user_details: result_latestdetails.rows[0],
      credit_details: result_credits.rows,
      debit_details: result_debits.rows,
    },
  };
};
module.exports = getWalletAndRechargeInformation;
