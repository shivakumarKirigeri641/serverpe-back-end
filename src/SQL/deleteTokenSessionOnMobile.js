const deleteTokenSessionOnMobile = async (client, mobile_number) => {
  try {
    await client.query("BEGIN");
    await client.query(
      "delete from serverpe_user_token_sessions where mobile_number=$1",
      [mobile_number]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
  }
};
module.exports = deleteTokenSessionOnMobile;
