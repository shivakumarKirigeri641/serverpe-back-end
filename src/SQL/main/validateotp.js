const generateapikey = require("../../utils/generateapikey");
const validateotp = async (client, mobile_number, otp) => {
  let result_apikey = null;
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
    //get user
    const result_user = await client.query(
      `select *from serverpe_user where mobile_number=$1`,
      [mobile_number]
    );
    //check if api key already exists
    if (result_user.rows[0].apikey_text) {
      result_apikey = result_user.rows[0].apikey_text;
    } else {
      //generate api key & update
      result_apikey = await generateapikey(
        mobile_number,
        result_user.rows[0].fk_state
      );
      //update user
      await client.query(
        `update serverpe_user set apikey_text = $1 where mobile_number = $2`,
        [result_apikey, mobile_number]
      );
    }
    return {
      statuscode: 200,
      successstatus: true,
      message: "Otp verified success fully!",
      data: {
        api_key: result_apikey,
      },
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
