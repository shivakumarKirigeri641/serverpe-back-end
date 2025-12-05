const validateotp = async (client, mobile_number, otp) => {
  //first delete if entry has expired!
  await client.query(`delete from serverpe_otpstore where expires_at < NOW()`);

  //now check
  const result = await client.query(
    `select *from serverpe_otpstore where mobile_number=$1 and otp=$2`,
    [mobile_number, otp]
  );
  if (0 < result.rows.length) {
    //success & delete it
    await client.query(
      `delete from serverpe_otpstore where mobile_number=$1 and otp=$2`,
      [mobile_number, otp]
    );
    return {
      statuscode: 200,
      successstatus: true,
      message: "Otp verified success fully!",
    };
  } else {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Otp expired, please re-enter the mobile number & try again!",
    };
  }
};
module.exports = validateotp;
