const getStationDetails = async (client, station_code) => {
  let result = null;
  try {
    result = await client.query("select *from stations where code = $1", [
      station_code,
    ]);
    return result;
  } catch (err) {
    throw {
      success: false,
      message: "Failed to fetch station details!",
      data: err.message,
    };
  }
};
module.exports = getStationDetails;
