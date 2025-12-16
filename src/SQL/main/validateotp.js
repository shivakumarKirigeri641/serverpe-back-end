const generateapikey = require("../../utils/generateapikey");
const generateSecretKey = require("../../utils/generateSecretKey");
const sendLoggedInUserSMS = require("../../utils/sendLoggedInUserSMS");
const validateotp = async (client, mobile_number, otp) => {
  let result_apikey = null;
  let secretkey = null;
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
      secretkey = result_user.rows[0].secret_key;
    } else {
      //generate api key & update
      result_apikey = await generateapikey(
        mobile_number,
        result_user.rows[0].fk_state
      );
      secretkey = await generateSecretKey();
      //update user
      await client.query(
        `update serverpe_user set apikey_text = $1, secret_key=$2 where mobile_number = $3`,
        [result_apikey, secretkey, mobile_number]
      );
      //getpricing
      const result_free_Price = await client.query(
        `select *from serverpe_apipricing where price=0`
      );
      //insert default credit
      await client.query(
        `insert into serverpe_user_apikeywallet_credit (fk_user, fk_pricing, credit_reason) values ($1,$2,$3);`,
        [
          result_user.rows[0].id,
          result_free_Price.rows[0].id,
          "first time subscription",
        ]
      );

      //insert free api calls wallet.
      await client.query(
        `insert into serverpe_user_apikeywallet (fk_user, outstanding_apikey_count, outstanding_apikey_count_free) values ($1,0,50);`,
        [result_user.rows[0].id]
      );
    }
    //alert notifification to me with SMS when user logins
    /*sendLoggedInUserSMS(
      result_user.rows[0].user_name,
      result_user.rows[0].mobile_number
    );*/
    return {
      statuscode: 200,
      successstatus: true,
      message: "Otp verified success fully!",
      data: {
        api_key: result_apikey,
        secret_key: secretkey,
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
