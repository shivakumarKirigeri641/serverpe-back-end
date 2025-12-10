const getBikeTypes = async (client, makename, modelname) => {
  const result = await client.query(
    `select distinct bike_type from vehicle_information where LOWER(brand) = LOWER($1) and LOWER(model) = LOWER($2) order by bike_type asc`,
    [makename, modelname]
  );
  if (0 < result.rows.length) {
    return result.rows;
  } else {
    return {
      statuscode: 204,
      successstatus: false,
      message: "Bike types information not found!",
    };
  }
};
module.exports = getBikeTypes;
