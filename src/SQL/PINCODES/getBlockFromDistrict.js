const getBlockByDistrict = async (client, selectedState, selectedDistrict) => {
  const result = await client.query(
    `select Block from pincodes where State =$1 and District=$2 order by Block`,
    [selectedState, selectedDistrict]
  );
  return result.rows;
};
module.exports = getBlockByDistrict;
