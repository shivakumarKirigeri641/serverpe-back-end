const getAllStations = async (client) => {
  try {
    return await client.query("select *from stations order by name asc");
  } catch (err) {
    throw {
      success: false,
      message: "Failed in fetching information on stations!",
      data: {},
    };
  }
};
module.exports = getAllStations;
