const generateapikey = require("../../utils/generateapikey");
const generateSecretKey = require("../../utils/generateSecretKey");
const sendLoggedInUserSMS = require("../../utils/sendLoggedInUserSMS");
const validateotp = async (client, mobile_number, email, otp_mobile, otp_email, ipAddress) => {
  let result_apikey = null;
  //first delete if entry has expired!
  await client.query(`delete from user_verification_otps where expires_at < NOW()`);

  //now check
  const result = await client.query(
    `select u.mobile_number, uvo.* from user_verification_otps uvo 
     inner join users u on u.id = uvo.fk_user_id 
     where u.mobile_number=$1 and u.email=$2 and uvo.otp_mobile=$3 and uvo.otp_email=$4`,
    [mobile_number, email, otp_mobile, otp_email]
  );

  if (0 < result.rows.length) {
    //success & delete it
    await client.query(
      `delete from user_verification_otps where id=$1`,
      [result.rows[0].id]
    );
    
    //alert notifification to me with SMS when user logins
    await sendLoggedInUserSMS(ipAddress, result_user.rows[0].mobile_number);
    return {
      statuscode: 200,
      successstatus: true,
      message: "Otp verified successfully!",
      data: {
        // api_key: result_apikey, // No longer generating API key here
      },
    };
  } else {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Otp expired or invalid, please re-enter & try again!",
    };
  }
};
module.exports = validateotp;
