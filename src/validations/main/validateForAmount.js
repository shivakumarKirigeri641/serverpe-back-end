const isNumeric = require("./isNumeric");
const validateForAmount = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.amount) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "amount information not found!",
    };
  }
  if (!req.body.amount) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "amount information not found!",
    };
  }
  if (!isNumeric(req.body.amount)) {
    return {
      statuscode: 422,
      successstatus: false,
      message: "Invalid amount!",
    };
  }
  if (req.body.amount < 0 || req.body.amount > 180) {
    return {
      statuscode: 422,
      successstatus: false,
      message: "Amount out of range!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForAmount;
