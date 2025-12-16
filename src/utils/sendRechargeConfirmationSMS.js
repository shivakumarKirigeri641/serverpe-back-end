const axios = require("axios");
require("dotenv").config();
const sendRechargeConfirmationSMS = async (
  mobile_number,
  amount_recharged,
  api_calls_credited,
  transactionid
) => {
  const fast2smsResp = await axios.get(`
    https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMSAPIKEY}&route=dlt&sender_id=SRVRPE&message=205287&variables_values=${amount_recharged}|${api_calls_credited}|${transactionid}&numbers=${mobile_number}`);
  if (fast2smsResp.data && fast2smsResp.data.return) {
    //dont do anything
    return { success: true, data: fast2smsResp.data };
  } else {
    // bubble details for debugging
    return { success: false, data: fast2smsResp.data };
  }
};
module.exports = sendRechargeConfirmationSMS;
