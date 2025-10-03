const insertToken = async (client, mobile_number, token) => {
  try {
    await client.query("BEGIN");
    await client.query(
      "insert into serverpe_user_token_sessions (mobile_number, generated_token) values ($1,$2)",
      [mobile_number, token]
    );
    await client.query("COMMIT");
  } catch (ERR) {
    await client.query("ROLLBACK");
    throw ERR;
  }
};

module.exports = insertToken;
