const validator = require('validator');

const insertLoginOtpEntry = async (client, data, otp) => {
  try {
    let isEmail = validator.isEmail(data.input_field);
    let query = "";
    let params = [];

    // 1. Determine query based on input type
    if (isEmail) {
      query = `SELECT id FROM users WHERE email = $1`;
      params = [data.input_field];
    } else {
      // Assume mobile if not email (validation should have happened before)
      query = `SELECT id FROM users WHERE mobile_number = $1`;
      params = [data.input_field];
    }

    // 2. Check if user exists
    const userResult = await client.query(query, params);

    if (userResult.rows.length === 0) {
      return {
        statuscode: 404, // Or 400 depending on preference, 404 fits "not found"
        successstatus: false,
        message: "User does not exist!",
      };
    }

    const userId = userResult.rows[0].id;

    // 3. Cleanup existing expired OTPs for this user
    await client.query(
        `DELETE FROM user_verification_otps WHERE fk_user_id = $1 AND expires_at < NOW()`,
        [userId]
    );

    // 4. Insert new OTP (same OTP for both mobile and email columns)
    await client.query(
      `INSERT INTO user_verification_otps (fk_user_id, otp_mobile, otp_email, expires_at) 
       VALUES ($1, $2, $3, NOW() + INTERVAL '3 minutes')`,
      [userId, otp, otp]
    );

    return {
      statuscode: 200,
      successstatus: true,
      message: "OTP sent successfully.",
    };

  } catch (err) {
    console.error("Error in insertLoginOtpEntry:", err);
    return {
      statuscode: 500,
      successstatus: false,
      message: err.message,
    };
  }
};

module.exports = insertLoginOtpEntry;
