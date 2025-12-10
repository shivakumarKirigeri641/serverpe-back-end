const getCarList = async (
  client,
  makename,
  modelname,
  seriesname,
  gradename
) => {
  const result = await client.query(
    `select *from vehicle_information where LOWER(brand) = LOWER($1) and LOWER(model) = LOWER($2) and lower(series) = lower($3) and lower(grade) = lower($4) order by production_from;`,
    [makename, modelname, seriesname, gradename]
  );
  if (0 < result.rows.length) {
    return result.rows;
  } else {
    return {
      statuscode: 204,
      successstatus: false,
      message: "cars information not found!",
    };
  }
};
module.exports = getCarList;
