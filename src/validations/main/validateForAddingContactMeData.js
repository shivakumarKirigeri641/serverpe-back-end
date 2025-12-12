const validator = require("validator");
const validateForAddingContactMeData = (req) => {
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
  if (!req.body.user_name) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "user_name not found!",
    };
  }
  if (!req.body.email) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "emailid not found!",
    };
  }
  if (!validator.isEmail(req.body.email)) {
    return {
      statuscode: 422,
      successstatus: false,
      message: "emailid invalid!",
    };
  }
  if (2 > req.body.user_name.length) {
    return {
      statuscode: 422,
      successstatus: false,
      message: "user_name invalid!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForAddingContactMeData;
