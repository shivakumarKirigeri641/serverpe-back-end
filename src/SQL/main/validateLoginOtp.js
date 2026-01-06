const validator = require('validator');
const sendLoggedInUserSMS = require("../../utils/sendLoggedInUserSMS");

const validateLoginOtp = async (client, input_field, otp, ipAddress) => {
  try {
    // 1. Determine input type
    let isEmail = validator.isEmail(input_field);
    let query = "";
    let params = [];

    // Cleanup expired OTPs
    await client.query(`delete from user_verification_otps where expires_at < NOW()`);

    // 2. Build Query
    // We need to join users and user_verification_otps
    // If input is email, check u.email and uvo.otp_email
    // If input is mobile, check u.mobile_number and uvo.otp_mobile
    
    if (isEmail) {
      query = `select u.mobile_number, uvo.* from user_verification_otps uvo 
               inner join users u on u.id = uvo.fk_user_id 
               where u.email=$1 and uvo.otp_email=$2`;
    } else {
      query = `select u.mobile_number, uvo.* from user_verification_otps uvo 
               inner join users u on u.id = uvo.fk_user_id 
               where u.mobile_number=$1 and uvo.otp_mobile=$2`;
    }
    
    params = [input_field, otp];

    // 3. Execute Check
    const result = await client.query(query, params);

    if (result.rows.length > 0) {
      // Success & delete it
      await client.query(
        `delete from user_verification_otps where id=$1`,
        [result.rows[0].id]
      );
      
      // Send optional alert
      // await sendLoggedInUserSMS(ipAddress, result.rows[0].mobile_number);

      return {
        statuscode: 200,
        successstatus: true,
        message: "Login successful!",
        data: {
             mobile_number: result.rows[0].mobile_number
        },
      };

    } else {
      return {
        statuscode: 404,
        successstatus: false,
        message: "OTP expired or invalid, please re-enter & try again!",
      };
    }

  } catch (err) {
    console.error("Error in validateLoginOtp:", err);
    return {
      statuscode: 500,
      successstatus: false,
      message: err.message,
    };
  }
};

module.exports = validateLoginOtp;