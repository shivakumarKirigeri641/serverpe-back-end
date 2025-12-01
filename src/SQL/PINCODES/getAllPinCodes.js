const getAllPinCodes = async (client) => {
  const result = await client.query(`select pincode from pincodes`);
  return result.rows;
};
module.exports = getAllPinCodes;
