const isNumeric = require("../main/isNumeric");
const validateForBikeSpecs = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.id) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "id not found!",
    };
  }
  if (!isNumeric(req.body.id)) {
    return {
      statuscode: 422,
      successstatus: false,
      message: "id is invalid!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForBikeSpecs;
