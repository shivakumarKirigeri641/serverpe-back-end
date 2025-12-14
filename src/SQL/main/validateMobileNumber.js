const validateMobileNumber = async (client, mobile_number) => {
  const result = await client.query(
    `select id from serverpe_user where mobile_number =$1`,
    [mobile_number]
  );
  return result.rows.length > 0;
};
module.exports = validateMobileNumber;
