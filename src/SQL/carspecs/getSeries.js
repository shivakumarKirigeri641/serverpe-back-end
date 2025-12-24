const getSeries = async (client, makename, modelname) => {
  const result = await client.query(
    `select distinct series from vehicle_information where LOWER(brand) = LOWER($1) and LOWER(model) = LOWER($2) order by series asc`,
    [makename, modelname]
  );
  if (0 < result.rows.length) {
    return result.rows;
  } else {
    return {
      statuscode: 422,
      successstatus: false,
      message: "Grade information not found!",
    };
  }
};
module.exports = getSeries;
