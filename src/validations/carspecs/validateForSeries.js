const validateForSeries = (req) => {
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
  if (!req.body.model) {
    return {
      statuscode: 404,
      successstatus: false,
      message: "model not found!",
    };
  }
  if (req.body.brand === "") {
    return {
      statuscode: 422,
      successstatus: false,
      message: "make_name is invalid!",
    };
  }
  if (req.body.model === "") {
    return {
      statuscode: 422,
      successstatus: false,
      message: "model is invalid!",
    };
  }
  return { statuscode: 200, successstatus: true, message: "success" };
};
module.exports = validateForSeries;
