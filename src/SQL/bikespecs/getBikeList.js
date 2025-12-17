const getBikeList = async (
  client,
  makename,
  modelname,
  bike_type,
  category
) => {
  const result = await client.query(
    `select *from vehicle_information where LOWER(brand) = LOWER($1) and LOWER(model) = LOWER($2) and lower(bike_type) = lower($3) and lower(category) = lower($4)order by year_of_manufacture;`,
    [makename, modelname, bike_type, category]
  );
  if (0 < result.rows.length) {
    return result.rows;
  } else {
    return {
      statuscode: 204,
      successstatus: false,
      message: "bikes information not found!",
    };
  }
};
module.exports = getBikeList;
