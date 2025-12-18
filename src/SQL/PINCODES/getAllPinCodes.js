const getAllPinCodes = async (client) => {
  const result = await client.query(
    `select distinct pincode from pincodes order by pincode`
  );
  return result.rows;
};
module.exports = getAllPinCodes;
