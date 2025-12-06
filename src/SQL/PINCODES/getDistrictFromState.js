const getDistrictFromState = async (client, selectedState) => {
  const result = await client.query(
    `select distinct District from pincodes where State =$1 order by District`,
    [selectedState]
  );
  return result.rows;
};
module.exports = getDistrictFromState;
