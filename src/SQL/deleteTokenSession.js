const deleteTokenSession = async (client, token) => {
  try {
    await client.query("BEGIN");
    await client.query(
      "delete from serverpe_user_token_sessions where generated_token=$1",
      [token]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
  } finally {
    await client.release();
  }
};
module.exports = deleteTokenSession;
