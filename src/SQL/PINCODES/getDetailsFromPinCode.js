const getDetailsFromPinCode = async (client, pincode) => {
  const result = await client.query(`select *from pincodes where pincode=$1`, [
    pincode,
  ]);
  return result.rows;
};
module.exports = getDetailsFromPinCode;
