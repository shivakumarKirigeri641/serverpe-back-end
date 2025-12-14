const getUserProfile = async (client, req) => {
  const result = await client.query(
    `select suser.id, suser.mobile_number, suser.user_name, suser.address, suser.created_at, suser.updated_at,
suser.myemail, suser.myemail_veifystatus, suser.address,
s.state_name, pricing.price, pricing.price_name from serverpe_apipricing pricing 
left join serverpe_user_apikeywallet_credit credit on credit.fk_pricing = pricing.id
join serverpe_user suser on suser.id=credit.fk_user
join states s on s.id=suser.fk_state
join serverpe_user_apikeywallet wallet on wallet.fk_user = suser.id
where suser.mobile_number=$1`,
    [req.mobile_number]
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows[0],
  };
};
module.exports = getUserProfile;
