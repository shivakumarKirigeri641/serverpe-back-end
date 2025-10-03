const deleteOtpSession = async (client, mobile_number) => {
  try {
    await client.query("BEGIN");
    await client.query(
      "delete from serverpe_user_otp_sessions where mobile_number=$1",
      [mobile_number]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
  }
};
module.exports = deleteOtpSession;
