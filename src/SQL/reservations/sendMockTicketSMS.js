const axios = require("axios");
require("dotenv").config();
const sendMockTicketSMS = async (
  mobile_number,
  pnr,
  train_number,
  train_name,
  departure_time
) => {
  const fast2smsResp = await axios.get(
    //`https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=dlt&sender_id=NOQTRN&message=198302&variables_values=${generatedotp}|${validfor}&numbers=${mobile_number}`
    `https://www.fast2sms.com/dev/bulkV2?authorization=${
      process.env.FAST2SMSAPIKEY
    }&route=dlt&sender_id=NOQPNR&message=200941&variables_values=${pnr}|${
      train_number + ", " + train_name
    }|${departure_time}&numbers=${mobile_number}`
  );
  if (fast2smsResp.data && fast2smsResp.data.return) {
    //dont do anything
    return { success: true, data: fast2smsResp.data };
  } else {
    // bubble details for debugging
    return { success: false, data: fast2smsResp.data };
  }
};
module.exports = sendMockTicketSMS;
