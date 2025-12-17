const axios = require("axios");
require("dotenv").config();
const sendAlertForFeedbackSMS = async (
  mobile_number,
  feedback_category,
  rating
) => {
  const fast2smsResp = await axios.get(
    `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMSAPIKEY}&route=dlt&sender_id=SRVRPE&message=205285&variables_values=${mobile_number}|${feedback_category}|${rating}&numbers=9886122415`
  );

  if (fast2smsResp.data && fast2smsResp.data.return) {
    //dont do anything
    return { success: true, data: fast2smsResp.data };
  } else {
    // bubble details for debugging
    return { success: false, data: fast2smsResp.data };
  }
};
module.exports = sendAlertForFeedbackSMS;
