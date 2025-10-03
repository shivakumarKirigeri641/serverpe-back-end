const checkAndinsertLogin = async (
  client,
  user_name,
  mobile_number,
  user_email,
  state_id,
  api_key,
  storedHash,
  isemail_verified = false
) => {
  let result = null;
  try {
    await client.query("BEGIN");
    result = await client.query(
      "select *from serverpe_user where mobile_number = $1",
      [mobile_number]
    );
    if (0 === result.rows.length) {
      result = await client.query(
        "insert into serverpe_user (user_name, mobile_number, user_email, state_id, api_key, storedHash,isemail_verified ) values ($1, $2, $3, $4, $5, $6, $7) returning *",
        [
          user_name,
          mobile_number,
          user_email,
          state_id,
          api_key,
          storedHash,
          isemail_verified,
        ]
      );
    }
    await client.query(
      "insert into serverpe_user_tracking (fkserverpe_user) values ($1) returning *",
      [result.rows[0].id]
    );
    await client.query("COMMIT");
    return result;
  } catch (ERR) {
    await client.query("ROLLBACK");
    throw ERR;
  }
};

module.exports = checkAndinsertLogin;
