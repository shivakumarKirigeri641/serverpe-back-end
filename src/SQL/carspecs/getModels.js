const getModels = async (client, makename) => {
  const result = await client.query(
    `select distinct model from vehicle_information where LOWER(brand) = LOWER($1) order by model asc`,
    [makename]
  );
  if (0 < result.rows.length) {
    return result.rows;
  } else {
    return {
      statuscode: 204,
      successstatus: false,
      message: "Model details not found!",
    };
  }
};
module.exports = getModels;
