const getStations = async (client) => {
  return await client.query(`select *from stations order by station_name`);
};
module.exports = getStations;
