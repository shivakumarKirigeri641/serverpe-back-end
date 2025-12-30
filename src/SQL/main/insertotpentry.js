const sendOTPSMS = require("../../utils/sendOTPSMS");

const insertotpentry = async (client, data, otp) => {
  try {
    //insert into user
    //insert into api history
    //insert into otp

    //first delete if mobile_number given has expired!
    await client.query(
      `delete from serverpe_otpstore where expires_at < NOW()`
    );
    const result_user = await client.query(
      `select *from serverpe_user where mobile_number=$1`,
      [data.mobile_number]
    );
    if (0 < result_user.rows.length) {
    } else {
      await client.query(
        `insert into serverpe_user (mobile_number) values ($1) returning *;`,
        [data.mobile_number]
      );
    }
    //alert here call fast2sms otp sms api
    //await sendOTPSMS(data.mobile_number, otp, 3);
    await client.query(
      `insert into serverpe_otpstore (mobile_number, otp, expires_at) values ($1,$2, NOW() + INTERVAL '3 minutes') returning *`,
      [data.mobile_number, otp]
    );
    return {
      statuscode: 200,
      successstatus: true,
      message: "OTP sent successfully.",
    };
  } catch (err) {
    return {
      statuscode: 500,
      successstatus: false,
      message: err.message,
    };
  }
};
module.exports = insertotpentry;
