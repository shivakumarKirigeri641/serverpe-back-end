const fetchApiHistory = async (client, mobile_number) => {
  const result = await client.query(
    `select u.*, sa.* from serverpe_user u join serverpe_apihistory sa on sa.user_id = u.id where u.mobile_number=$1 order by sa.id desc`,
    [mobile_number]
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows,
    message: "History fetched successfully.",
  };
};
module.exports = fetchApiHistory;
