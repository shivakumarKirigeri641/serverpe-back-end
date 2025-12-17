const getStatesAndTerritories = async (client) => {
  const result = await client.query(
    `select id, state_name from states order by state_name`
  );
  return result.rows;
};
module.exports = getStatesAndTerritories;
