const isNumeric = require("../main/isNumeric");
const validateForInsertFeedback = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.category) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "category not found!",
    };
  }
  if (!isNumeric(req.body.rating)) {
    return {
      statuscode: 400,
      successstatus: false,
      message: "rating not found!",
    };
  }
  if (1 > req.body.rating || 5 < req.body.rating) {
    return {
      statuscode: 400,
      successstatus: false,
      message: "rating is invalid!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForInsertFeedback;
