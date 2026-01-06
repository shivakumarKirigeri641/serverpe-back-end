const insertotpentry = async (client, data, otp_mobile, otp_email) => {
  try {
    // Check if email exists
    const emailResult = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [data.email]
    );

    if (emailResult.rows.length > 0) {
      return {
        statuscode: 400,
        successstatus: false,
        message: "User already subscribed, please login",
      };
    }

    // Check if user exists by mobile
    let userResult = await client.query(
      `SELECT id FROM users WHERE mobile_number = $1`,
      [data.mobile_number]
    );

    if (userResult.rows.length > 0) {
      return {
        statuscode: 400,
        successstatus: false,
        message: "user with this mobile already subscribed, please login",
      };
    }
    //alert here call fast2sms otp sms api
    await sendOTPSMS(data.mobile_number, otp, 3);
    await client.query(
      `insert into serverpe_otpstore (mobile_number, otp, expires_at) values ($1,$2, NOW() + INTERVAL '3 minutes') returning *`,
      [data.mobile_number, otp]
    );
    //hardcoded to  for college_id  temporary
    userId = insertUserResult.rows[0].id;

    // Insert OTPs into user_verification_otps
    // First, expire old OTPs for this user (optional, but good for cleanup)
    await client.query(
        `DELETE FROM user_verification_otps WHERE fk_user_id = $1 AND expires_at < NOW()`,
        [userId]
    );

    await client.query(
      `INSERT INTO user_verification_otps (fk_user_id, otp_mobile, otp_email, expires_at) 
       VALUES ($1, $2, $3, NOW() + INTERVAL '3 minutes')`,
      [userId, otp_mobile, otp_email]
    );

    return {
      statuscode: 200,
      successstatus: true,
      message: "OTP sent successfully.",
    };
  } catch (err) {
    console.error("Error in insertotpentry:", err);
    return {
      statuscode: 500,
      successstatus: false,
      message: err.message,
    };
  }
};
module.exports = insertotpentry;
