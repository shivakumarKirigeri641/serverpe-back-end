const getStations = async (client) => {
  const result = await client.query(
    `select *from stations order by station_name`
  );
  return result.rows;
};
module.exports = getStations;
