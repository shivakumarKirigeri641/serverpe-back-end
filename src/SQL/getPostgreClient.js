const getPostgreClient = async (pool) => {
  let client = null;
  try {
    client = await pool.connect();
  } catch (err) {
    throw {
      success: false,
      message: "Unable to connect db",
      data: err,
    };
  }
  return client;
};
module.exports = getPostgreClient;
