const axios = require("axios");
require("dotenv").config();
const sendAlertForContactRequestSMS = async (
  user_name,
  email,
  feedback_category
) => {
  const fast2smsResp = await axios.get(
    `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMSAPIKEY}&route=dlt&sender_id=SRVRPE&message=205286&variables_values=${user_name}|${email}|${feedback_category}&numbers=${process.env.MYOWNNUMBER}`
  );

  if (fast2smsResp.data && fast2smsResp.data.return) {
    //dont do anything
    return { success: true, data: fast2smsResp.data };
  } else {
    // bubble details for debugging
    return { success: false, data: fast2smsResp.data };
  }
};
module.exports = sendAlertForContactRequestSMS;
