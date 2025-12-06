const getStatesAndTerritories = async (client) => {
  const result = await client.query(
    `select distinct State from pincodes order by State`
  );
  return result.rows;
};
module.exports = getStatesAndTerritories;
