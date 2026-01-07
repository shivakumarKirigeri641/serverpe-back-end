const validateStudentMobileNumber = async (client, mobile_number) => {
  const result = await client.query(
    `select id from users where mobile_number =$1`,
    [mobile_number]
  );
  return result.rows.length > 0;
};
module.exports = validateStudentMobileNumber;
