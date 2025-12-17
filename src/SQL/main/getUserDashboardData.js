const getUserDashboardData = async (client, req) => {
  //api credentials
  //wallet balance
  //latest 5 api history
  //which plan?

  const result_userdetails = await client.query(
    `select suser.user_name, suser.mobile_number, s.state_name,suser.apikey_text, suser.secret_key, (wallet.outstanding_apikey_count_free +  wallet.outstanding_apikey_count) as api_credits from serverpe_apipricing pricing 
left join serverpe_user_apikeywallet_credit credit on credit.fk_pricing = pricing.id
join serverpe_user suser on suser.id=credit.fk_user
join states s on s.id=suser.fk_state
join serverpe_user_apikeywallet wallet on wallet.fk_user = suser.id
where suser.mobile_number=$1`,
    [req.mobile_number]
  );
  //plan details
  const result_plan = await client.query(
    `select pricing.price, pricing.price_name from serverpe_apipricing pricing left join serverpe_user_apikeywallet_credit credit
on credit.fk_pricing = pricing.id join serverpe_user suser on 
suser.id=credit.fk_user where suser.mobile_number=$1
    `,
    [req.mobile_number]
  );
  //last latest 5 api history
  const result_api_history_latest_5 = await client.query(
    `SELECT history.endpoint, history.method, history.response_status, history.latency, history.created_at FROM public.serverpe_apihistory history
join serverpe_user suser on suser.id = history.user_id
where suser.mobile_number=$1
order by created_at desc limit 5`,
    [req.mobile_number]
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: {
      user_details: result_userdetails.rows[0],
      user_plan: result_plan.rows[0],
      latest_5_api_histories: result_api_history_latest_5.rows,
    },
  };
};
module.exports = getUserDashboardData;
