const validateForModels = (req) => {
  if (!req.body) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "Request body information not found!",
    };
  }
  if (!req.body.brand) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "brand not found!",
    };
  }
  if (req.body.brand === "") {
    return {
      statuscode: 422,
      successstatus: false,
      message: "brand is invalid!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForModels;
