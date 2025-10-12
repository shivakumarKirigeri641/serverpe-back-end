const insertLoginTracking = async (client, result_data) => {
  try {
    await client.query("BEGIN");
    await client.query(
      "insert into serverpe_user_token_sessions_logintracker (mobile_number) values ($1)",
      [result_data.rows[0].mobile_number]
    );
    await client.query("COMMIT");
  } catch (ERR) {
    await client.query("ROLLBACK");
    throw ERR;
  }
};

module.exports = insertLoginTracking;
