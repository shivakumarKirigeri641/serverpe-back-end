const convertQuerySpecToJson = require("../../utils/carspecs/convertQuerySpecToJson");
const getBikeSpecs = async (client, id) => {
  let result = await client.query(
    `SELECT 
    sc.category_name,
    sh.header_name,
    sv.value_text
FROM spec_value sv
JOIN spec_header sh ON sv.header_id = sh.id
JOIN spec_category sc ON sh.category_id = sc.id
WHERE sv.vehicle_id = $1
ORDER BY sc.id, sh.id;`,
    [id]
  );
  if (0 < result.rows.length) {
    result = convertQuerySpecToJson(result.rows);
    return result;
  } else {
    return {
      statuscode: 422,
      successstatus: false,
      message: "Vehicle details not found!",
    };
  }
};
module.exports = getBikeSpecs;
