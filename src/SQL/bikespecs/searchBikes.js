const path = require("path");
const fs = require("fs");
const searchBikes = async (client, query, limit, skip) => {
  let result = await client.query(
    `SELECT *
      FROM vehicle_information
      WHERE 
        brand ILIKE '%' || $1 || '%' OR
        model ILIKE '%' || $1 || '%' OR
        bike_type ILIKE '%' || $1 || '%' OR
        category ILIKE '%' || $1 || '%' OR
        year_of_manufacture ILIKE '%' || $1 || '%'
      ORDER BY brand ASC, model ASC
      LIMIT $2 OFFSET $3`,
    [query, limit, skip]
  );
  if (0 < result.rows.length) {
    //return result.rows;
    const vehicles = result.rows.map((v) => {
      const imgName = `${v.brand.toLowerCase().replace(/\s+/g, "")}.png`;
      const logoPath = path.join(
        __dirname,
        "../../images/logos/original",
        imgName
      );

      return {
        ...v,
        logo: fs.existsSync(logoPath)
          ? `http://localhost:8888/images/logos/original/${imgName}`
          : null,
      };
    });
    return vehicles;
  } else {
    return {
      statuscode: 422,
      successstatus: false,
      message: "cars information not found!",
    };
  }
};
module.exports = searchBikes;
