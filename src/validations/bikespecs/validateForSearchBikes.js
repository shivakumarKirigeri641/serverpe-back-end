const isNumeric = require("../main/isNumeric");

const validateForSearchBikes = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.query) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "search query not found!",
    };
  }
  if (req.body.query === "") {
    return {
      statuscode: 422,
      successstatus: false,
      message: "search query is invalid!",
    };
  }
  if (!isNumeric(req.body.limit)) {
    return {
      statuscode: 422,
      successstatus: false,
      message: "limit is invalid!",
    };
  }
  if (!isNumeric(req.body.skip)) {
    return {
      statuscode: 422,
      successstatus: false,
      message: "skip is invalid!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForSearchBikes;
