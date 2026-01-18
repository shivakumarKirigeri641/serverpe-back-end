const axios = require("axios");
require("dotenv").config();
const sendConfirmTicketSMS = async (
  mobile_number,
  pnr,
  train_number,
  train_name,
  date_of_journey,
  departure,
) => {
  const fast2smsResp = await axios.get(
    //`https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMSAPIKEY}&route=dlt&sender_id=SRVRPE&message=204637&variables_values=${generatedotp}|${validfor}&numbers=${mobile_number}`
    `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMSAPIKEY}&route=dlt&sender_id=NOQPNR&message=200941&variables_values=${pnr}|${train_number} , ${train_name}|${date_of_journey}, ${departure}&numbers=${mobile_number}`,
  );
  if (fast2smsResp.data && fast2smsResp.data.return) {
    //dont do anything
    return { success: true, data: fast2smsResp.data };
  } else {
    // bubble details for debugging
    return { success: false, data: fast2smsResp.data };
  }
};
module.exports = sendConfirmTicketSMS;
