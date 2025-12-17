const updateUserProfile = async (client, req) => {
  const result = await client.query(
    `update serverpe_user set address=$1, myemail=$2, myemail_veifystatus=$3, user_name=$4 where mobile_number=$5 returning *`,
    [
      req.body.address,
      req.body.myemail_verifystatus ? req.body.myemail : null,
      req.body.myemail_verifystatus,
      req.body.user_name,
      req.mobile_number,
    ]
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows[0],
  };
};
module.exports = updateUserProfile;
