const getTokenDetails = async (client, token) => {
  let result = null;
  try {
    result = await client.query(
      "select *from serverpe_user_token_sessions where generated_token = $1",
      [token]
    );
    return result;
  } catch (err) {
    throw {
      success: false,
      message: "Failed to fetch token!",
      data: err.message,
    };
  }
};
module.exports = getTokenDetails;
