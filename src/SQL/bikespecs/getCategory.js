const getCategory = async (client, makename, modelname, bike_type) => {
  const result = await client.query(
    `select distinct category from vehicle_information where LOWER(brand) = LOWER($1) and LOWER(model) = LOWER($2) and lower(bike_type) = lower($3) order by category asc`,
    [makename, modelname, bike_type]
  );
  if (0 < result.rows.length) {
    return result.rows;
  } else {
    return {
      statuscode: 204,
      successstatus: false,
      message: "Grade information not found!",
    };
  }
};
module.exports = getCategory;
