const getGrades = async (client, makename, modelname, seriesname) => {
  const result = await client.query(
    `select distinct grade from vehicle_information where LOWER(brand) = LOWER($1) and LOWER(model) = LOWER($2) and lower(series) = lower($3) order by grade asc`,
    [makename, modelname, seriesname]
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
module.exports = getGrades;
