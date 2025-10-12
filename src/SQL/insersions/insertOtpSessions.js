const bcrypt = require("bcryptjs");
const insertOtpSessions = async (client, mobile_number, otp) => {
  try {
    const salt = await bcrypt.genSalt(1);
    const hasedotp = await bcrypt.hash(otp.toString(), salt);
    await client.query(
      "insert into serverpe_user_otp_sessions (mobile_number, hashed_otp) values ($1,$2)",
      [mobile_number, hasedotp]
    );
  } catch (err) {
    throw {
      success: false,
      message: "Failed in fetching information from session!",
      data: {},
    };
  }
};

module.exports = insertOtpSessions;
