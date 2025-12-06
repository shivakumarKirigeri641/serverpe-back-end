const getFullDetailsFromBranchType = async (
  client,
  selectedState,
  selectedDistrict,
  selectedBlock,
  selectedBranchType
) => {
  const result = await client.query(
    `select *from pincodes where State =$1 and District=$2 and Block=$3 and branch_type=$4 order by Block`,
    [selectedState, selectedDistrict, selectedBlock, selectedBranchType]
  );
  return result.rows;
};
module.exports = getFullDetailsFromBranchType;
