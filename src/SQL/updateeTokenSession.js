const updateeTokenSession = async (client, token) => {
  try {
    await client.query("BEGIN");
    await client.query(
      "update serverpe_user_token_sessions set generated_token=$1 where generated_token=$2",
      [token, token]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw {
      success: false,
      message: "Failed in updating the session!",
      data: err.message,
    };
  }
};
module.exports = updateeTokenSession;
