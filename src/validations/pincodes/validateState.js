const validateState = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.selectedState) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "State not found!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateState;
