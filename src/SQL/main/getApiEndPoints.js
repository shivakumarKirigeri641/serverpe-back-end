const groupEndpointsByCategory = require("../../utils/groupEndpointsByCategory");
const getApiEndPoints = async (client) => {
  let result = await client.query(`select *from serverpe_api_endpoints;`);
  result = groupEndpointsByCategory(result.rows);
  return {
    statuscode: 200,
    successstatus: true,
    data: result,
    message: "api endpoints details fetched successfully.",
  };
};
module.exports = getApiEndPoints;
