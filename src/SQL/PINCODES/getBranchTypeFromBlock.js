const getBranchTypeFromBlock = async (
  client,
  selectedState,
  selectedDistrict,
  selectedBlock
) => {
  const result = await client.query(
    `select BranchType from pincodes where State =$1 and District=$2 and Block=$3 order by BranchType`,
    [selectedState, selectedDistrict, selectedBlock]
  );
  return result.rows;
};
module.exports = getBranchTypeFromBlock;
